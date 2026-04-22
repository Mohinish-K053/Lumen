from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from database import get_db
from models.user_model import User
from utils.jwt_handler import create_access_token, verify_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Schemas ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Register ─────────────────────────────────────────────
@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(body.password)
    user = User(name=body.name, email=body.email, password_hash=hashed)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {"message": "User registered successfully", "user_id": user.id}


# ── Login ────────────────────────────────────────────────
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


# ── Profile ──────────────────────────────────────────────
@router.get("/profile")
async def profile(current_user: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at
    }