from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime

from database import get_db
from models.session_model import StudySession, CognitiveLog
from utils.jwt_handler import verify_token
from services.ai_service import predict_from_bytes

router = APIRouter(prefix="/session", tags=["Study Sessions"])


# ── Start Session ─────────────────────────────────────────
@router.post("/start")
async def start_session(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    session = StudySession(user_id=current_user["user_id"], status="active")
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": session.id, "status": "active", "start_time": session.start_time}


# ── Pause Session ─────────────────────────────────────────
@router.post("/pause/{session_id}")
async def pause_session(
    session_id: int,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StudySession).where(StudySession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "paused"
    await db.commit()
    return {"session_id": session_id, "status": "paused"}


# ── Resume Session ────────────────────────────────────────
@router.post("/resume/{session_id}")
async def resume_session(
    session_id: int,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StudySession).where(StudySession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "active"
    await db.commit()
    return {"session_id": session_id, "status": "active"}


# ── Stop Session ──────────────────────────────────────────
@router.post("/stop/{session_id}")
async def stop_session(
    session_id: int,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StudySession).where(StudySession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Calculate average cognitive load from logs
    logs_result = await db.execute(
        select(CognitiveLog).where(CognitiveLog.session_id == session_id)
    )
    logs = logs_result.scalars().all()

    if logs:
        load_map = {"Low Load": 0, "Optimal Load": 1, "High Load": 2}
        avg_score = sum(load_map.get(l.cognitive_load, 1) for l in logs) / len(logs)
        if avg_score < 0.5:
            avg_load = "Low Load"
        elif avg_score < 1.5:
            avg_load = "Optimal Load"
        else:
            avg_load = "High Load"
    else:
        avg_load = "No Data"

    session.status   = "stopped"
    session.end_time = datetime.utcnow()
    session.average_cognitive_load = avg_load
    await db.commit()

    return {
        "session_id": session_id,
        "status": "stopped",
        "end_time": session.end_time,
        "average_cognitive_load": avg_load
    }


# ── Session History ───────────────────────────────────────
@router.get("/history")
async def session_history(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(StudySession)
        .where(StudySession.user_id == current_user["user_id"])
        .order_by(StudySession.start_time.desc())
    )
    sessions = result.scalars().all()

    return [
        {
            "session_id": s.id,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "status": s.status,
            "average_cognitive_load": s.average_cognitive_load
        }
        for s in sessions
    ]


# ── Predict (Single Frame Upload) ─────────────────────────
@router.post("/predict/{session_id}")
async def predict(
    session_id: int,
    frame: UploadFile = File(...),
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    image_bytes = await frame.read()
    result = predict_from_bytes(image_bytes)

    log = CognitiveLog(
        session_id     = session_id,
        emotion        = result["emotion"],
        cognitive_load = result["cognitive_load"],
        confidence     = result["confidence"]
    )
    db.add(log)
    await db.commit()

    return result