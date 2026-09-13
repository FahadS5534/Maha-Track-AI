import os
from typing import Optional, List
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import engine, Base, get_db
from app.models import Complaint, Worker, Zone, ComplaintEvent
from app import schemas
from app.classifier import classifier_instance
from app.priority import calculate_priority_score
from app.seed import seed_database
from app.auth import create_access_token, verify_token, STAFF_CREDENTIALS

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Maha-Track AI Backend",
    description="Civic Sanitation Response & Transparency API for Nashik Simhastha Kumbh Mela 2027",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    classifier_instance.load_or_train()
    if db.query(Zone).count() == 0 or db.query(Complaint).count() == 0:
        print("Empty database detected. Generating synthetic seed dataset...")
        seed_database(db)

# --- AUTH ENDPOINTS ---
@app.post("/auth/login")
def login(creds: dict):
    email = creds.get("email")
    password = creds.get("password")
    if email in STAFF_CREDENTIALS and STAFF_CREDENTIALS[email] == password:
        token = create_access_token({"sub": email, "role": "admin"})
        return {"access_token": token, "token_type": "bearer", "email": email}
    raise HTTPException(status_code=401, detail="Invalid admin email or password")


# --- CLASSIFICATION ENDPOINT ---
@app.post("/classify", response_model=schemas.ClassifyResponse)
def classify_text(req: schemas.ClassifyRequest):
    if not req.raw_text or len(req.raw_text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text must be at least 3 characters.")
    return classifier_instance.predict(req.raw_text)


# --- CITIZEN COMPLAINT SUBMISSION (WITH DUPLICATE CHECK) ---
@app.post("/complaints", response_model=schemas.ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_complaint(req: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    cls_res = classifier_instance.predict(req.raw_text)
    category = cls_res["category"]
    department = cls_res["department"]

    now = datetime.utcnow()

    existing_open = db.query(Complaint).filter(
        Complaint.zone == req.zone,
        Complaint.category == category,
        Complaint.status.in_(["reported", "assigned", "in_progress"])
    ).first()

    if existing_open:
        existing_open.duplicate_count = (existing_open.duplicate_count or 1) + 1
        existing_open.is_duplicate = True
        existing_open.priority_score = min(100, existing_open.priority_score + 15)

        dup_event = ComplaintEvent(
            complaint_id=existing_open.id,
            event_type="DUPLICATE_REPORTED",
            timestamp=now,
            details=f"Another citizen reported this same issue in {req.zone}. Priority score boosted to {existing_open.priority_score} (Total reports: {existing_open.duplicate_count})."
        )
        db.add(dup_event)
        db.commit()

        refreshed = db.query(Complaint).options(
            joinedload(Complaint.assigned_worker),
            joinedload(Complaint.events)
        ).filter(Complaint.id == existing_open.id).first()

        res_dict = schemas.ComplaintOut.from_orm(refreshed)
        res_dict.already_reported = True
        return res_dict

    lat = req.lat
    lng = req.lng
    zone_obj = db.query(Zone).filter(Zone.name == req.zone).first()
    if zone_obj and (lat is None or lng is None):
        lat = zone_obj.lat
        lng = zone_obj.lng

    priority = calculate_priority_score(category, now, req.zone, db)

    complaint = Complaint(
        raw_text=req.raw_text,
        category=category,
        department=department,
        zone=req.zone,
        priority_score=priority,
        status="reported",
        photo_url=req.photo_url,
        is_synthetic=False,
        duplicate_count=1,
        is_duplicate=False,
        created_at=now,
        lat=lat,
        lng=lng
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    event = ComplaintEvent(
        complaint_id=complaint.id,
        event_type="CREATED",
        timestamp=now,
        details=f"New report created by citizen. Auto-classified as '{category}' ({department}) with confidence {cls_res['confidence']*100:.1f}%."
    )
    db.add(event)
    db.commit()

    res = db.query(Complaint).options(
        joinedload(Complaint.assigned_worker),
        joinedload(Complaint.events)
    ).filter(Complaint.id == complaint.id).first()

    res_out = schemas.ComplaintOut.from_orm(res)
    res_out.already_reported = False
    return res_out


# --- STAFF QUEUE & COMPLAINT MANAGEMENT ---
@app.get("/complaints", response_model=List[schemas.ComplaintOut])
def get_complaints(
    status: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    priority_min: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(verify_token)
):
    query = db.query(Complaint).options(
        joinedload(Complaint.assigned_worker),
        joinedload(Complaint.events)
    )

    if status and status != "all":
        query = query.filter(Complaint.status == status)
    if zone and zone != "all":
        query = query.filter(Complaint.zone == zone)
    if priority_min is not None:
        query = query.filter(Complaint.priority_score >= priority_min)

    return query.order_by(Complaint.priority_score.desc(), Complaint.created_at.desc()).all()


@app.get("/complaints/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint_detail(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).options(
        joinedload(Complaint.assigned_worker),
        joinedload(Complaint.events)
    ).filter(Complaint.id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@app.patch("/complaints/{complaint_id}/assign", response_model=schemas.ComplaintOut)
def assign_worker(
    complaint_id: str,
    req: schemas.ComplaintAssign,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(verify_token)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    worker = db.query(Worker).filter(Worker.id == req.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    now = datetime.utcnow()
    complaint.assigned_worker_id = worker.id
    complaint.status = "assigned"
    complaint.assigned_at = now
    worker.status = "on_task"

    event = ComplaintEvent(
        complaint_id=complaint.id,
        event_type="ASSIGNED",
        timestamp=now,
        details=f"Assigned to worker '{worker.name}' (Contact: {worker.phone}, Zone: {worker.zone})."
    )
    db.add(event)
    db.commit()

    return get_complaint_detail(complaint_id, db)


@app.patch("/complaints/{complaint_id}/status", response_model=schemas.ComplaintOut)
def update_status(
    complaint_id: str,
    req: schemas.ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(verify_token)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if req.status not in ["assigned", "in_progress", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    now = datetime.utcnow()
    old_status = complaint.status
    complaint.status = req.status

    if req.status == "resolved":
        complaint.resolved_at = now
        if complaint.assigned_worker:
            complaint.assigned_worker.status = "available"
        event_type = "RESOLVED"
        details = "Sanitation issue marked as resolved and verified on ground by staff."
    else:
        event_type = "STATUS_CHANGED"
        details = f"Status updated from '{old_status}' to '{req.status}'."

    event = ComplaintEvent(
        complaint_id=complaint.id,
        event_type=event_type,
        timestamp=now,
        details=details
    )
    db.add(event)
    db.commit()

    return get_complaint_detail(complaint_id, db)


# --- WORKERS & ZONES ENDPOINTS ---
@app.get("/workers", response_model=List[schemas.WorkerOut])
def list_workers(zone: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Worker)
    if zone and zone != "all":
        query = query.filter(Worker.zone == zone)
    workers = query.all()

    res = []
    for w in workers:
        active_count = db.query(Complaint).filter(
            Complaint.assigned_worker_id == w.id,
            Complaint.status.in_(["assigned", "in_progress"])
        ).count()
        w_out = schemas.WorkerOut.from_orm(w)
        w_out.active_tasks_count = active_count
        res.append(w_out)
    return res

@app.get("/zones", response_model=List[schemas.ZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(Zone).order_by(Zone.sector_code).all()


# --- PUBLIC TRANSPARENCY STATS ENDPOINTS ---
@app.get("/stats/response-times", response_model=schemas.ResponseTimesStats)
def get_response_time_stats(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    by_zone_res = []
    total_hours_sum = 0.0
    total_resolved_count = 0

    for z in zones:
        resolved_complaints = db.query(Complaint).filter(
            Complaint.zone == z.name,
            Complaint.status == "resolved",
            Complaint.created_at.isnot(None),
            Complaint.resolved_at.isnot(None)
        ).all()

        total_cnt = db.query(Complaint).filter(Complaint.zone == z.name).count()
        res_cnt = len(resolved_complaints)

        if res_cnt > 0:
            diffs = [(c.resolved_at - c.created_at).total_seconds() / 3600.0 for c in resolved_complaints]
            avg_hours = sum(diffs) / res_cnt
            total_hours_sum += sum(diffs)
            total_resolved_count += res_cnt
        else:
            avg_hours = 0.0

        by_zone_res.append(schemas.ZoneResponseTime(
            zone=z.name,
            avg_resolution_hours=round(avg_hours, 2),
            total_complaints=total_cnt,
            resolved_complaints=res_cnt
        ))

    departments = ["Sanitation Dept", "Water Supply Dept", "Drainage & Sewage Dept", "Solid Waste Management", "Public Health Dept"]
    by_dept_res = []

    for d in departments:
        resolved_complaints = db.query(Complaint).filter(
            Complaint.department == d,
            Complaint.status == "resolved",
            Complaint.created_at.isnot(None),
            Complaint.resolved_at.isnot(None)
        ).all()

        total_cnt = db.query(Complaint).filter(Complaint.department == d).count()
        res_cnt = len(resolved_complaints)

        if res_cnt > 0:
            diffs = [(c.resolved_at - c.created_at).total_seconds() / 3600.0 for c in resolved_complaints]
            avg_hours = sum(diffs) / res_cnt
        else:
            avg_hours = 0.0

        by_dept_res.append(schemas.DepartmentResponseTime(
            department=d,
            avg_resolution_hours=round(avg_hours, 2),
            total_complaints=total_cnt,
            resolved_complaints=res_cnt
        ))

    overall_avg = round(total_hours_sum / total_resolved_count, 2) if total_resolved_count > 0 else 0.0

    return schemas.ResponseTimesStats(
        by_zone=by_zone_res,
        by_department=by_dept_res,
        overall_avg_resolution_hours=overall_avg
    )


@app.get("/stats/summary", response_model=schemas.SummaryStats)
def get_summary_stats(db: Session = Depends(get_db)):
    total_count = db.query(Complaint).count()
    resolved_count = db.query(Complaint).filter(Complaint.status == "resolved").count()
    in_progress_count = db.query(Complaint).filter(Complaint.status == "in_progress").count()
    assigned_count = db.query(Complaint).filter(Complaint.status == "assigned").count()
    synthetic_count = db.query(Complaint).filter(Complaint.is_synthetic == True).count()

    synthetic_pct = round((synthetic_count / total_count * 100.0), 1) if total_count > 0 else 0.0

    zones = db.query(Zone).all()
    by_zone = {}
    for z in zones:
        z_count = db.query(Complaint).filter(Complaint.zone == z.name).count()
        z_resolved = db.query(Complaint).filter(Complaint.zone == z.name, Complaint.status == "resolved").count()
        by_zone[z.name] = {"total": z_count, "resolved": z_resolved}

    cats = ["toilet_overflow", "no_water", "blocked_drain", "waste_bin_full", "broken_handwashing"]
    by_category = {}
    for c in cats:
        c_count = db.query(Complaint).filter(Complaint.category == c).count()
        by_category[c] = c_count

    return schemas.SummaryStats(
        total_reported=total_count,
        total_resolved=resolved_count,
        total_in_progress=in_progress_count,
        total_assigned=assigned_count,
        total_synthetic=synthetic_count,
        synthetic_percentage=synthetic_pct,
        by_zone=by_zone,
        by_category=by_category,
        classifier_metrics=classifier_instance.metrics
    )


@app.post("/seed")
def trigger_reseed(db: Session = Depends(get_db)):
    seed_database(db)
    return {"message": "Database successfully re-seeded with synthetic dataset!"}
