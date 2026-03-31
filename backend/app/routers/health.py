from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def liveness():
    """Проверяет, что процесс API жив."""
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness(db: AsyncSession = Depends(get_db)):
    """Проверяет готовность API обслуживать запросы к БД."""
    await db.execute(text("SELECT 1"))
    return {"status": "ready"}
