from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import Complaint

CATEGORY_SEVERITY_WEIGHTS = {
    "toilet_overflow": 40,
    "no_water": 35,
    "blocked_drain": 30,
    "broken_handwashing": 25,
    "waste_bin_full": 20
}

def calculate_priority_score(category: str, created_at: datetime, zone: str, db: Session) -> int:
    """
    Computes priority score (0 - 100) using a transparent weighted rule formula:
    Priority = SeverityWeight (max 40) + TimePendingFactor (max 30) + ZoneClusterDensity (max 30)
    """
    # 1. Base Severity Weight
    severity_weight = CATEGORY_SEVERITY_WEIGHTS.get(category, 20)

    # 2. Time Pending Factor (2.5 points per hour, capped at 30 points -> ~12 hours max impact)
    now = datetime.utcnow()
    if created_at is None:
        created_at = now
    
    elapsed_seconds = max(0, (now - created_at).total_seconds())
    elapsed_hours = elapsed_seconds / 3600.0
    pending_factor = min(30.0, elapsed_hours * 2.5)

    # 3. Zone Cluster Density Factor (4 points per open complaint in the same zone, capped at 30 points)
    open_complaints_count = db.query(Complaint).filter(
        Complaint.zone == zone,
        Complaint.status.in_(["reported", "assigned", "in_progress"])
    ).count()

    cluster_factor = min(30.0, open_complaints_count * 4.0)

    total_score = int(round(severity_weight + pending_factor + cluster_factor))
    return max(0, min(100, total_score))
