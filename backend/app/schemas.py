from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ComplaintCreate(BaseModel):
    raw_text: str = Field(..., min_length=3, description="Citizen complaint text")
    zone: str = Field(..., description="Zone name, e.g. Sector 1 (Sangam Bank)")
    photo_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ComplaintAssign(BaseModel):
    worker_id: str

class ComplaintStatusUpdate(BaseModel):
    status: str # assigned | in_progress | resolved

class ComplaintEventOut(BaseModel):
    id: str
    event_type: str
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True

class WorkerOut(BaseModel):
    id: str
    name: str
    zone: str
    status: str
    is_synthetic: bool

    class Config:
        from_attributes = True

class ComplaintOut(BaseModel):
    id: str
    raw_text: str
    category: str
    department: str
    zone: str
    priority_score: int
    status: str
    photo_url: Optional[str] = None
    is_synthetic: bool
    created_at: datetime
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    assigned_worker_id: Optional[str] = None
    assigned_worker: Optional[WorkerOut] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    events: List[ComplaintEventOut] = []

    class Config:
        from_attributes = True

class ClassifyRequest(BaseModel):
    raw_text: str

class ClassifyResponse(BaseModel):
    category: str
    department: str
    confidence: float

class ZoneOut(BaseModel):
    id: str
    name: str
    sector_code: str
    lat: float
    lng: float

    class Config:
        from_attributes = True

class ZoneResponseTime(BaseModel):
    zone: str
    avg_resolution_hours: float
    total_complaints: int
    resolved_complaints: int

class DepartmentResponseTime(BaseModel):
    department: str
    avg_resolution_hours: float
    total_complaints: int
    resolved_complaints: int

class ResponseTimesStats(BaseModel):
    by_zone: List[ZoneResponseTime]
    by_department: List[DepartmentResponseTime]
    overall_avg_resolution_hours: float

class SummaryStats(BaseModel):
    total_reported: int
    total_resolved: int
    total_in_progress: int
    total_assigned: int
    total_synthetic: int
    synthetic_percentage: float
    by_zone: dict
    by_category: dict
    classifier_metrics: dict
