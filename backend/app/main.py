from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import AsyncSessionLocal
from app.routers import blog, collections, feedback, health, services
from app.routers import settings as settings_router
from app.config import get_settings
from app.legacy_import import import_legacy_portfolio_if_configured, import_theme_seed_if_configured
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Сид и импорты при старте (схема — только через Alembic)."""
    async with AsyncSessionLocal() as session:
        await seed_if_empty(session)
        await import_legacy_portfolio_if_configured(session, get_settings())
        await import_theme_seed_if_configured(session, get_settings())
        await seed_if_empty(session)
    yield


def create_app() -> FastAPI:
    """Создает и конфигурирует экземпляр FastAPI приложения."""
    settings = get_settings()
    application = FastAPI(title="Photographer portfolio API", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(health.router, prefix="/api")
    application.include_router(settings_router.router, prefix="/api")
    application.include_router(collections.router, prefix="/api")
    application.include_router(blog.router, prefix="/api")
    application.include_router(services.router, prefix="/api")
    application.include_router(feedback.router, prefix="/api")

    upload = Path(settings.upload_dir)
    upload.mkdir(parents=True, exist_ok=True)
    application.mount("/media", StaticFiles(directory=str(upload)), name="media")
    return application


app = create_app()
