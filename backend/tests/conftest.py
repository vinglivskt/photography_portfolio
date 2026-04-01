"""Pytest: только PostgreSQL, схема через Alembic до запуска тестов."""

import asyncio
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_DEFAULT_TEST_DB = "postgresql+asyncpg://portfolio_test:portfolio_test@127.0.0.1:5432/portfolio_test"

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def pytest_configure(config):
    """До импорта test_*.py и app.main — иначе database.py закеширует чужой DATABASE_URL."""
    os.environ["DATABASE_URL"] = os.environ.get("PYTEST_DATABASE_URL", _DEFAULT_TEST_DB)
    os.environ.pop("ALEMBIC_DATABASE_URL", None)
    os.environ.setdefault("UPLOAD_DIR", "./data/uploads")
    os.environ.pop("LEGACY_MEDIA_IMPORT_DIR", None)
    os.environ.pop("FORCE_LEGACY_MEDIA_REIMPORT", None)
    from app.config import get_settings

    get_settings.cache_clear()


def pytest_sessionstart(session):
    from alembic import command
    from alembic.config import Config

    from app.config import get_settings

    sync_url = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    os.environ["ALEMBIC_DATABASE_URL"] = sync_url
    try:
        get_settings.cache_clear()
        backend_root = Path(__file__).resolve().parent.parent
        cfg = Config(str(backend_root / "alembic.ini"))
        command.upgrade(cfg, "head")
    finally:
        os.environ.pop("ALEMBIC_DATABASE_URL", None)


@pytest.fixture(scope="session")
def api_client():
    """Один TestClient на сессию: повторные контексты ломают asyncpg на другом event loop."""
    from app.main import app

    with TestClient(app) as client:
        yield client
