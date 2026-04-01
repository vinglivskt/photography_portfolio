from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    """Базовый класс SQLAlchemy моделей."""


engine = create_async_engine(
    get_settings().database_url,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    """Выдает асинхронную сессию БД в рамках запроса FastAPI."""
    async with AsyncSessionLocal() as session:
        yield session
