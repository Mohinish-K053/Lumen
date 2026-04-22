from fastapi import FastAPI, WebSocket, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from database import engine, Base, get_db
from routes.auth_routes import router as auth_router
from routes.session_routes import router as session_router
from routes.analytics_routes import router as analytics_router
from services.websocket_service import handle_websocket_session

app = FastAPI(title="Lumen API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth_router)
app.include_router(session_router)
app.include_router(analytics_router)

@app.get("/")
async def root():
    return {"message": "Lumen API is running ✅"}

@app.websocket("/ws/session/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: AsyncSession = Depends(get_db)):
    await handle_websocket_session(websocket, session_id, db)