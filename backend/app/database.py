import os

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool

from app.config import get_settings


class Base(DeclarativeBase):
    """Базовый класс SQLAlchemy моделей."""


def _database_url() -> str:
    """Возвращает URL БД с отдельным режимом для pytest."""
    if os.environ.get("PYTEST_RUNNING") == "1":
        return "sqlite+aiosqlite:///:memory:?cache=shared"
    return get_settings().database_url


_engine_kwargs = {}
if os.environ.get("PYTEST_RUNNING") == "1":
    _engine_kwargs = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    }

engine = create_async_engine(
    _database_url(),
    pool_pre_ping=True,
    **_engine_kwargs,
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
