import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import Zone, Worker, Complaint, ComplaintEvent
from app.classifier import classifier_instance
from app.priority import calculate_priority_score

SECTORS_DATA = [
    {"name": "Sector 1 (Sangam Ghat)", "sector_code": "SEC-01", "lat": 25.4320, "lng": 81.8885},
    {"name": "Sector 2 (Shastri Bridge)", "sector_code": "SEC-02", "lat": 25.4395, "lng": 81.8820},
    {"name": "Sector 3 (Parade Ground)", "sector_code": "SEC-03", "lat": 25.4450, "lng": 81.8740},
    {"name": "Sector 4 (Arail Ghat)", "sector_code": "SEC-04", "lat": 25.4180, "lng": 81.8760},
    {"name": "Sector 5 (Jhunsi Pontoon 1)", "sector_code": "SEC-05", "lat": 25.4380, "lng": 81.8990},
    {"name": "Sector 6 (Jhunsi Pontoon 2)", "sector_code": "SEC-06", "lat": 25.4420, "lng": 81.9050},
    {"name": "Sector 7 (Nagvasuki Temple)", "sector_code": "SEC-07", "lat": 25.4560, "lng": 81.8710},
    {"name": "Sector 8 (Bhakti Vedant Marg)", "sector_code": "SEC-08", "lat": 25.4490, "lng": 81.8890},
    {"name": "Sector 9 (Kalyani Devi Road)", "sector_code": "SEC-09", "lat": 25.4280, "lng": 81.8550},
    {"name": "Sector 10 (Trivenipuram Gate)", "sector_code": "SEC-10", "lat": 25.4470, "lng": 81.9180},
    {"name": "Sector 11 (VVIP Tent City)", "sector_code": "SEC-11", "lat": 25.4290, "lng": 81.8790},
    {"name": "Sector 12 (Akshayavat Marg)", "sector_code": "SEC-12", "lat": 25.4310, "lng": 81.8720},
    {"name": "Sector 13 (Sangam Control Room)", "sector_code": "SEC-13", "lat": 25.4360, "lng": 81.8810},
    {"name": "Sector 14 (Food Plaza & Bazaar)", "sector_code": "SEC-14", "lat": 25.4410, "lng": 81.8680},
    {"name": "Sector 15 (Pilgrim Shelter 3)", "sector_code": "SEC-15", "lat": 25.4230, "lng": 81.8640},
    {"name": "Sector 16 (Daraganj Station Side)", "sector_code": "SEC-16", "lat": 25.4520, "lng": 81.8800}
]

WORKERS_NAMES = [
    ("Ramesh Kumar", "Sector 1 (Sangam Ghat)", "+91 98123 45671", "Sanitation Dept"),
    ("Suresh Sharma", "Sector 1 (Sangam Ghat)", "+91 98123 45672", "Water Supply Dept"),
    ("Amit Yadav", "Sector 2 (Shastri Bridge)", "+91 98123 45673", "Drainage & Sewage Dept"),
    ("Vikram Singh", "Sector 3 (Parade Ground)", "+91 98123 45674", "Solid Waste Management"),
    ("Pankaj Verma", "Sector 4 (Arail Ghat)", "+91 98123 45675", "Public Health Dept"),
    ("Dinesh Gupta", "Sector 5 (Jhunsi Pontoon 1)", "+91 98123 45676", "Sanitation Dept"),
    ("Manoj Tiwari", "Sector 6 (Jhunsi Pontoon 2)", "+91 98123 45677", "Water Supply Dept"),
    ("Sunil Kumar", "Sector 7 (Nagvasuki Temple)", "+91 98123 45678", "Solid Waste Management"),
    ("Rajesh Bind", "Sector 8 (Bhakti Vedant Marg)", "+91 98123 45679", "Sanitation Dept"),
    ("Deepak Maurya", "Sector 9 (Kalyani Devi Road)", "+91 98123 45680", "Drainage & Sewage Dept"),
    ("Santosh Prajapati", "Sector 10 (Trivenipuram Gate)", "+91 98123 45681", "Sanitation Dept"),
    ("Anil Pal", "Sector 11 (VVIP Tent City)", "+91 98123 45682", "Public Health Dept"),
    ("Rakesh Nishad", "Sector 12 (Akshayavat Marg)", "+91 98123 45683", "Sanitation Dept"),
    ("Vipin Pandey", "Sector 13 (Sangam Control Room)", "+91 98123 45684", "Water Supply Dept"),
    ("Vijay Mishra", "Sector 14 (Food Plaza & Bazaar)", "+91 98123 45685", "Solid Waste Management"),
    ("Sanjay Gauttam", "Sector 15 (Pilgrim Shelter 3)", "+91 98123 45686", "Public Health Dept"),
    ("Gopal Tripathi", "Sector 16 (Daraganj Station Side)", "+91 98123 45687", "Drainage & Sewage Dept")
]

SEED_COMPLAINT_TEMPLATES = [
    ("Sector 1 (Sangam Ghat) mein toilet block complete overflow ho gaya gandi badboo aa rahi hai", 25.4322, 81.8888),
    ("No water in drinking tap near Sector 1 Sangam Ghat bathing area", 25.4325, 81.8890),
    ("Naali choked with plastic and black sewage spilling on Sector 2 road", 25.4398, 81.8824),
    ("Dustbin completely full in Sector 3 Parade Ground garbage overflowing", 25.4452, 81.8745),
    ("Handwash station faucet broken water continuously leaking Sector 4 Arail Ghat", 25.4182, 81.8763),
    ("Sector 5 toilet me paani nahi aa raha flush zero pressure", 25.4383, 81.8993),
    ("Drain blocked near Sector 6 food stalls dirty water logging", 25.4423, 81.9054),
    ("Kachre ka dher near Nagvasuki Temple gate Sector 7 bin overfilled", 25.4562, 81.8714),
    ("Toilet complex 3 overflow leakage Sector 8 Bhakti Vedant Marg", 25.4493, 81.8894),
    ("Water supply stopped in tap stand Sector 9 Kalyani Devi Road", 25.4283, 81.8553),
    ("Choked nala near Trivenipuram Gate Sector 10 sewage flooding walkway", 25.4473, 81.9184),
    ("Broken handwash basin spraying muddy water Sector 11 VVIP Tent City", 25.4293, 81.8794),
    ("Bio toilet overflow in Sector 12 Akshayavat Marg pilgrims complaining", 25.4313, 81.8724),
    ("Drinking water kiosk dry Sector 13 Sangam Control Room side", 25.4363, 81.8814),
    ("Trash bin full with paper plates and tea cups Sector 14 Food Plaza", 25.4413, 81.8684),
    ("Handwashing unit tap missing Sector 15 Pilgrim Shelter 3", 25.4233, 81.8644),
    ("Nala jam problem near Daraganj station Sector 16", 25.4523, 81.8804)
]

def seed_database(db: Session):
    print("Training ML classifier pipeline...")
    classifier_metrics = classifier_instance.train()
    print(f"Classifier trained: Accuracy={classifier_metrics['accuracy']}, Macro F1={classifier_metrics['f1_score']}")

    # Drop and recreate tables to ensure schema matches
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Seed Zones
    for s in SECTORS_DATA:
        z = Zone(name=s["name"], sector_code=s["sector_code"], lat=s["lat"], lng=s["lng"])
        db.add(z)
    db.commit()

    # 2. Seed Workers
    workers_list = []
    for name, z_name, phone, dept in WORKERS_NAMES:
        w = Worker(name=name, zone=z_name, phone=phone, department=dept, status="available", is_synthetic=True)
        db.add(w)
        workers_list.append(w)
    db.commit()

    # 3. Seed Complaints (~180 records over past 48 hours)
    now = datetime.utcnow()
    statuses_weights = ["resolved"] * 50 + ["in_progress"] * 25 + ["assigned"] * 15 + ["reported"] * 10
    
    for i in range(180):
        tmpl_text, default_lat, default_lng = random.choice(SEED_COMPLAINT_TEMPLATES)
        z_obj = random.choice(SECTORS_DATA)
        zone_name = z_obj["name"]
        
        lat = z_obj["lat"] + random.uniform(-0.003, 0.003)
        lng = z_obj["lng"] + random.uniform(-0.003, 0.003)

        prefixes = ["Emergency: ", "Please fix: ", "Urgent issue - ", "Help needed - ", "Report: "]
        raw_text = random.choice(prefixes) + tmpl_text

        cls_result = classifier_instance.predict(raw_text)
        category = cls_result["category"]
        department = cls_result["department"]

        created_minutes_ago = random.randint(15, 2880)
        created_at = now - timedelta(minutes=created_minutes_ago)

        status = random.choice(statuses_weights)
        assigned_at = None
        resolved_at = None
        assigned_worker_id = None

        matching_workers = [w for w in workers_list if w.zone == zone_name]
        worker = matching_workers[0] if matching_workers else random.choice(workers_list)

        if status in ["assigned", "in_progress", "resolved"]:
            assigned_at = created_at + timedelta(minutes=random.randint(5, 45))
            assigned_worker_id = worker.id

        if status == "resolved":
            resolution_duration_mins = random.randint(20, 180)
            resolved_at = (assigned_at or created_at) + timedelta(minutes=resolution_duration_mins)

        priority_score = calculate_priority_score(category, created_at, zone_name, db)

        complaint = Complaint(
            raw_text=raw_text,
            category=category,
            department=department,
            zone=zone_name,
            priority_score=priority_score,
            status=status,
            photo_url=None,
            is_synthetic=True,
            duplicate_count=random.choice([1, 1, 1, 2, 3]),
            is_duplicate=False,
            created_at=created_at,
            assigned_at=assigned_at,
            resolved_at=resolved_at,
            assigned_worker_id=assigned_worker_id,
            lat=round(lat, 5),
            lng=round(lng, 5)
        )
        db.add(complaint)
        db.flush()

        ev1 = ComplaintEvent(
            complaint_id=complaint.id,
            event_type="CREATED",
            timestamp=created_at,
            details=f"Submitted by citizen via public form. Auto-classified as '{category}' ({department})."
        )
        db.add(ev1)

        if assigned_at:
            ev2 = ComplaintEvent(
                complaint_id=complaint.id,
                event_type="ASSIGNED",
                timestamp=assigned_at,
                details=f"Assigned to worker '{worker.name}' (Contact: {worker.phone}, Zone: {zone_name})."
            )
            db.add(ev2)

        if status in ["in_progress", "resolved"]:
            ev3 = ComplaintEvent(
                complaint_id=complaint.id,
                event_type="STATUS_CHANGED",
                timestamp=assigned_at + timedelta(minutes=10) if assigned_at else created_at + timedelta(minutes=10),
                details=f"Status set to 'in_progress'. Worker dispatched on location."
            )
            db.add(ev3)

        if resolved_at:
            ev4 = ComplaintEvent(
                complaint_id=complaint.id,
                event_type="RESOLVED",
                timestamp=resolved_at,
                details=f"Sanitation issue successfully resolved and verified on ground."
            )
            db.add(ev4)

    db.commit()
    print(f"Successfully seeded 16 zones, {len(workers_list)} workers, and 180 synthetic complaints with events!")
