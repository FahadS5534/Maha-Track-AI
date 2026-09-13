import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    sector_code = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    complaints = relationship("Complaint", back_populates="zone_rel")
    workers = relationship("Worker", back_populates="zone_rel")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, default="+91 98765 43210")
    department = Column(String, default="Sanitation Dept")
    zone = Column(String, ForeignKey("zones.name"), nullable=False)
    status = Column(String, default="available") # available | on_task
    is_synthetic = Column(Boolean, default=True)

    zone_rel = relationship("Zone", back_populates="workers")
    assigned_complaints = relationship("Complaint", back_populates="assigned_worker")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=generate_uuid)
    raw_text = Column(Text, nullable=False)
    category = Column(String, nullable=False) # toilet_overflow, no_water, blocked_drain, waste_bin_full, broken_handwashing
    department = Column(String, nullable=False)
    zone = Column(String, ForeignKey("zones.name"), nullable=False)
    priority_score = Column(Integer, default=0) # 0 - 100
    status = Column(String, default="reported") # reported | assigned | in_progress | resolved
    photo_url = Column(Text, nullable=True)
    is_synthetic = Column(Boolean, default=True)
    duplicate_count = Column(Integer, default=1)
    is_duplicate = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    assigned_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    assigned_worker_id = Column(String, ForeignKey("workers.id"), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    zone_rel = relationship("Zone", back_populates="complaints")
    assigned_worker = relationship("Worker", back_populates="assigned_complaints")
    events = relationship("ComplaintEvent", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintEvent(Base):
    __tablename__ = "complaint_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    event_type = Column(String, nullable=False) # CREATED | CLASSIFIED | ASSIGNED | STATUS_CHANGED | RESOLVED | DUPLICATE_REPORTED
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    complaint = relationship("Complaint", back_populates="events")
