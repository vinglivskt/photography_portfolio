"""Контекст Alembic: sync-движок psycopg v3 и metadata моделей (PostgreSQL)."""

from __future__ import annotations

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Модели должны быть импортированы до target_metadata
from app.config import get_settings
from app.database import Base
from app.models import (  # noqa: F401
    BlogPost,
    CollectionItem,
    FeedbackMessage,
    ServiceItem,
    SiteSettings,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_sync_database_url() -> str:
    """Sync URL для миграций (postgresql:// + psycopg2 по умолчанию в SQLAlchemy)."""
    explicit = os.environ.get("ALEMBIC_DATABASE_URL", "").strip()
    if explicit:
        if "postgresql+asyncpg://" in explicit:
            return explicit.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        return explicit
    url = get_settings().database_url
    if "+asyncpg" in url:
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
    return url


def run_migrations_offline() -> None:
    url = get_sync_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        get_sync_database_url(),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
