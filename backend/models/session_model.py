from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from database import Base

class StudySession(Base):
    __tablename__ = "study_sessions"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time           = Column(DateTime(timezone=True), server_default=func.now())
    end_time             = Column(DateTime(timezone=True), nullable=True)
    status               = Column(String, default="active")   # active, paused, stopped
    average_cognitive_load = Column(String, nullable=True)


class CognitiveLog(Base):
    __tablename__ = "cognitive_logs"

    id              = Column(Integer, primary_key=True, index=True)
    session_id      = Column(Integer, ForeignKey("study_sessions.id"), nullable=False)
    emotion         = Column(String, nullable=False)
    cognitive_load  = Column(String, nullable=False)   # Low Load / Optimal Load / High Load
    confidence      = Column(Float, nullable=False)
    timestamp       = Column(DateTime(timezone=True), server_default=func.now())