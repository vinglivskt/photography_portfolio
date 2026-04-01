"""site_settings: колонки для старых БД (таблица была без миграции)

Revision ID: 8f2c1a9b3d71
Revises: 337e37826129
Create Date: 2026-04-02

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8f2c1a9b3d71"
down_revision: Union[str, Sequence[str], None] = "337e37826129"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IF NOT EXISTS: таблица могла появиться до полной схемы (create_all / старый деплой).
    op.execute(
        """
        ALTER TABLE site_settings
        ADD COLUMN IF NOT EXISTS public_short_name VARCHAR(200) NOT NULL DEFAULT '';
        """
    )
    op.execute(
        """
        ALTER TABLE site_settings
        ADD COLUMN IF NOT EXISTS hero_subtitle VARCHAR(500) NOT NULL DEFAULT '';
        """
    )
    op.execute(
        """
        ALTER TABLE site_settings
        ADD COLUMN IF NOT EXISTS author_image_paths JSON NOT NULL DEFAULT '[]'::json;
        """
    )
    op.execute(
        """
        ALTER TABLE site_settings
        ALTER COLUMN public_short_name DROP DEFAULT;
        """
    )
    op.execute(
        """
        ALTER TABLE site_settings
        ALTER COLUMN hero_subtitle DROP DEFAULT;
        """
    )
    op.execute(
        """
        ALTER TABLE site_settings
        ALTER COLUMN author_image_paths DROP DEFAULT;
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS author_image_paths")
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS hero_subtitle")
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS public_short_name")
