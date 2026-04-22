from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os, ssl

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://lumenadmin:Lumen1776001361Secure!@lumen-postgres.cp2a0wckifdh.ap-south-1.rds.amazonaws.com:5432/lumendb?ssl=require"
)

# SSL required for RDS PostgreSQL
connect_args = {}
if DATABASE_URL.startswith("postgresql"):
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    connect_args = {"ssl": ssl_ctx}

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
