from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.media_utils import public_media_url
from app.models import SiteSettings
from app.schemas import SiteSettingsOut

router = APIRouter(prefix="/settings", tags=["settings"])


async def _get_row(db: AsyncSession) -> SiteSettings:
    """Возвращает единственную запись настроек сайта, создавая ее при отсутствии."""
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.id).limit(1))
    row = result.scalar_one_or_none()
    if row is None:
        row = SiteSettings()
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


@router.get("", response_model=SiteSettingsOut)
async def read_settings(db: AsyncSession = Depends(get_db)) -> SiteSettingsOut:
    """Отдает настройки сайта с нормализованными URL изображений."""
    row = await _get_row(db)
    base = SiteSettingsOut.model_validate(row)
    return base.model_copy(
        update={
            "about_image": public_media_url(row.about_image),
            "hero_image_1": public_media_url(row.hero_image_1),
            "hero_image_2": public_media_url(row.hero_image_2),
        }
    )
