from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models.session_model import StudySession, CognitiveLog
from utils.jwt_handler import verify_token

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── Weekly Summary ────────────────────────────────────────
@router.get("/weekly")
async def weekly_analytics(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    one_week_ago = datetime.utcnow() - timedelta(days=7)

    result = await db.execute(
        select(StudySession).where(
            StudySession.user_id   == current_user["user_id"],
            StudySession.start_time >= one_week_ago
        )
    )
    sessions = result.scalars().all()

    total_sessions = len(sessions)
    stopped = [s for s in sessions if s.status == "stopped"]

    # Build daily breakdown
    daily = {}
    for s in sessions:
        day = s.start_time.strftime("%A")  # Monday, Tuesday...
        daily[day] = daily.get(day, 0) + 1

    return {
        "total_sessions_this_week": total_sessions,
        "completed_sessions": len(stopped),
        "daily_breakdown": daily
    }


# ── Cognitive Load Distribution ───────────────────────────
@router.get("/load")
async def load_distribution(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    # Get all session IDs for this user
    sessions_result = await db.execute(
        select(StudySession.id).where(StudySession.user_id == current_user["user_id"])
    )
    session_ids = [row[0] for row in sessions_result.fetchall()]

    if not session_ids:
        return {"Low Load": 0, "Optimal Load": 0, "High Load": 0}

    logs_result = await db.execute(
        select(CognitiveLog).where(CognitiveLog.session_id.in_(session_ids))
    )
    logs = logs_result.scalars().all()

    distribution = {"Low Load": 0, "Optimal Load": 0, "High Load": 0}
    for log in logs:
        if log.cognitive_load in distribution:
            distribution[log.cognitive_load] += 1

    return distribution


# ── Productivity Stats ────────────────────────────────────
@router.get("/productivity")
async def productivity(
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    sessions_result = await db.execute(
        select(StudySession).where(
            StudySession.user_id == current_user["user_id"],
            StudySession.status  == "stopped"
        )
    )
    sessions = sessions_result.scalars().all()

    if not sessions:
        return {"message": "No completed sessions yet"}

    # Find most productive hour (hour with most optimal load)
    session_ids = [s.id for s in sessions]
    logs_result = await db.execute(
        select(CognitiveLog).where(
            CognitiveLog.session_id.in_(session_ids),
            CognitiveLog.cognitive_load == "Optimal Load"
        )
    )
    optimal_logs = logs_result.scalars().all()

    hour_counts = {}
    for log in optimal_logs:
        hour = log.timestamp.strftime("%I %p")  # e.g. "09 AM"
        hour_counts[hour] = hour_counts.get(hour, 0) + 1

    most_productive_hour = max(hour_counts, key=hour_counts.get) if hour_counts else "N/A"

    # Average session duration
    durations = []
    for s in sessions:
        if s.end_time and s.start_time:
            diff = (s.end_time - s.start_time).seconds / 60  # in minutes
            durations.append(diff)

    avg_duration = round(sum(durations) / len(durations), 1) if durations else 0

    return {
        "total_completed_sessions": len(sessions),
        "most_productive_hour": most_productive_hour,
        "avg_session_duration_minutes": avg_duration
    }