import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import Zone, Worker, Complaint, ComplaintEvent
from app.classifier import classifier_instance
from app.priority import calculate_priority_score

# Nashik-Trimbakeshwar Simhastha Kumbh Mela 2027 Sectors & Coordinates
SECTORS_DATA = [
    {"name": "Sector 1 (Ramkund Bathing Ghat)", "sector_code": "SEC-01", "lat": 19.9985, "lng": 73.7925},
    {"name": "Sector 2 (Tapovan Sadhugram Camp)", "sector_code": "SEC-02", "lat": 19.9930, "lng": 73.8050},
    {"name": "Sector 3 (Kalaram Temple Sector)", "sector_code": "SEC-03", "lat": 19.9995, "lng": 73.7940},
    {"name": "Sector 4 (Trimbakeshwar Kushavart Kund)", "sector_code": "SEC-04", "lat": 19.9325, "lng": 73.5305},
    {"name": "Sector 5 (Panchavati Ghat & Sita Gufa)", "sector_code": "SEC-05", "lat": 19.9970, "lng": 73.7930},
    {"name": "Sector 6 (Gauri Patangan & Talkuteshwar)", "sector_code": "SEC-06", "lat": 19.9960, "lng": 73.7960},
    {"name": "Sector 7 (Kapaleshwar Temple Marg)", "sector_code": "SEC-07", "lat": 19.9990, "lng": 73.7915},
    {"name": "Sector 8 (Ahilyabai Holkar Bridge)", "sector_code": "SEC-08", "lat": 20.0010, "lng": 73.7900},
    {"name": "Sector 9 (Sadhugram Sector 2 - Tapovan)", "sector_code": "SEC-09", "lat": 19.9910, "lng": 73.8080},
    {"name": "Sector 10 (Nilgiri Baug Bus & Parking)", "sector_code": "SEC-10", "lat": 19.9880, "lng": 73.8150},
    {"name": "Sector 11 (VVIP Tent City - Godavari)", "sector_code": "SEC-11", "lat": 19.9950, "lng": 73.8000},
    {"name": "Sector 12 (Trimbak Road Entry Hub)", "sector_code": "SEC-12", "lat": 19.9650, "lng": 73.7500},
    {"name": "Sector 13 (Nashik Control Room - Panchavati)", "sector_code": "SEC-13", "lat": 19.9975, "lng": 73.7905},
    {"name": "Sector 14 (Food Plaza & Bazaar - Gangapur)", "sector_code": "SEC-14", "lat": 20.0050, "lng": 73.7750},
    {"name": "Sector 15 (Pilgrim Shelter - Nashik Road)", "sector_code": "SEC-15", "lat": 19.9550, "lng": 73.8300},
    {"name": "Sector 16 (Brahmagiri Foothills - Trimbak)", "sector_code": "SEC-16", "lat": 19.9300, "lng": 73.5250}
]

WORKERS_NAMES = [
    ("Sanjay Patil", "Sector 1 (Ramkund Bathing Ghat)", "+91 98220 11001", "Sanitation Dept"),
    ("Prakash Deshmukh", "Sector 1 (Ramkund Bathing Ghat)", "+91 98220 11002", "Water Supply Dept"),
    ("Vinod Shinde", "Sector 2 (Tapovan Sadhugram Camp)", "+91 98220 11003", "Drainage & Sewage Dept"),
    ("Ganesh Kulkarni", "Sector 3 (Kalaram Temple Sector)", "+91 98220 11004", "Solid Waste Management"),
    ("Sachin Pawar", "Sector 4 (Trimbakeshwar Kushavart Kund)", "+91 98220 11005", "Public Health Dept"),
    ("Nitin Jadhav", "Sector 5 (Panchavati Ghat & Sita Gufa)", "+91 98220 11006", "Sanitation Dept"),
    ("Mahesh More", "Sector 6 (Gauri Patangan & Talkuteshwar)", "+91 98220 11007", "Water Supply Dept"),
    ("Rahul Gaikwad", "Sector 7 (Kapaleshwar Temple Marg)", "+91 98220 11008", "Solid Waste Management"),
    ("Vijay Wagh", "Sector 8 (Ahilyabai Holkar Bridge)", "+91 98220 11009", "Sanitation Dept"),
    ("Santosh Bhosale", "Sector 9 (Sadhugram Sector 2 - Tapovan)", "+91 98220 11010", "Drainage & Sewage Dept"),
    ("Anil Sonawane", "Sector 10 (Nilgiri Baug Bus & Parking)", "+91 98220 11011", "Sanitation Dept"),
    ("Dnyaneshwar Chaudhari", "Sector 11 (VVIP Tent City - Godavari)", "+91 98220 11012", "Public Health Dept"),
    ("Sunil Jagtap", "Sector 12 (Trimbak Road Entry Hub)", "+91 98220 11013", "Sanitation Dept"),
    ("Vilas Khairnar", "Sector 13 (Nashik Control Room - Panchavati)", "+91 98220 11014", "Water Supply Dept"),
    ("Ashok Borse", "Sector 14 (Food Plaza & Bazaar - Gangapur)", "+91 98220 11015", "Solid Waste Management"),
    ("Rajendra Bhamare", "Sector 15 (Pilgrim Shelter - Nashik Road)", "+91 98220 11016", "Public Health Dept"),
    ("Kiran Malpure", "Sector 16 (Brahmagiri Foothills - Trimbak)", "+91 98220 11017", "Drainage & Sewage Dept")
]

SEED_COMPLAINT_TEMPLATES = [
    ("Sector 1 (Ramkund Bathing Ghat) mein toilet block complete overflow ho gaya gandi badboo aa rahi hai", 19.9985, 73.7925),
    ("No water in drinking tap near Sector 1 Ramkund Godavari ghat area", 19.9987, 73.7927),
    ("Naali choked with plastic and black sewage spilling on Sector 2 Tapovan road", 19.9932, 73.8052),
    ("Dustbin completely full in Sector 3 Kalaram Temple area garbage overflowing", 19.9997, 73.7942),
    ("Handwash station faucet broken water continuously leaking Sector 4 Trimbakeshwar Kushavart Kund", 19.9327, 73.5307),
    ("Sector 5 Panchavati Ghat toilet me paani nahi aa raha flush zero pressure", 19.9972, 73.7932),
    ("Drain blocked near Sector 6 Gauri Patangan food stalls dirty water logging", 19.9962, 73.7962),
    ("Kachre ka dher near Kapaleshwar Temple gate Sector 7 bin overfilled", 19.9992, 73.7917),
    ("Toilet complex 3 overflow leakage Sector 8 Ahilyabai Holkar Bridge side", 20.0012, 73.7902),
    ("Water supply stopped in tap stand Sector 9 Tapovan Sadhugram Sector 2", 19.9912, 73.8082),
    ("Choked nala near Nilgiri Baug Bus Stand Sector 10 sewage flooding walkway", 19.9882, 73.8152),
    ("Broken handwash basin spraying muddy water Sector 11 VVIP Tent City Godavari", 19.9952, 73.8002),
    ("Bio toilet overflow in Sector 12 Trimbak Road Entry Hub pilgrims complaining", 19.9652, 73.7502),
    ("Drinking water kiosk dry Sector 13 Nashik Control Room Panchavati side", 19.9977, 73.7907),
    ("Trash bin full with paper plates and tea cups Sector 14 Food Plaza Gangapur Road", 20.0052, 73.7752),
    ("Handwashing unit tap missing Sector 15 Pilgrim Shelter Nashik Road Station", 19.9552, 73.8302),
    ("Nala jam problem near Brahmagiri Foothills Trimbak Sector 16", 19.9302, 73.5252)
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
    print(f"Successfully seeded 16 Nashik sectors, {len(workers_list)} workers, and 180 synthetic complaints with events!")
