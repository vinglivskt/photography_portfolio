import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.media_utils import public_media_url
from app.models import CollectionItem
from app.schemas import CollectionOut, PaginatedCollections

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=PaginatedCollections)
async def list_collections(
    page: int = Query(1, ge=1),
    per_page: int = Query(6, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Возвращает постраничный список работ для раздела коллекций."""
    total = await db.scalar(select(func.count()).select_from(CollectionItem)) or 0
    pages = max(1, math.ceil(total / per_page)) if total else 1
    page = min(page, pages)
    offset = (page - 1) * per_page
    result = await db.execute(
        select(CollectionItem)
        .order_by(CollectionItem.sort_order, CollectionItem.id)
        .offset(offset)
        .limit(per_page)
    )
    rows = result.scalars().all()
    items = [
        CollectionOut(
            id=r.id,
            title=r.title,
            description=r.description,
            image_url=public_media_url(r.image_path),
            external_url=r.external_url or "",
            sort_order=r.sort_order,
        )
        for r in rows
    ]
    return PaginatedCollections(
        items=items, total=total, page=page, per_page=per_page, pages=pages
    )
