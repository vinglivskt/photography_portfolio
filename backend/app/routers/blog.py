import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.media_utils import public_media_url
from app.models import BlogPost
from app.schemas import BlogPostOut, PaginatedBlog

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("", response_model=PaginatedBlog)
async def list_blog(
    page: int = Query(1, ge=1),
    per_page: int = Query(4, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Возвращает постраничный список публикаций блога."""
    total = await db.scalar(select(func.count()).select_from(BlogPost)) or 0
    pages = max(1, math.ceil(total / per_page)) if total else 1
    page = min(page, pages)
    offset = (page - 1) * per_page
    result = await db.execute(
        select(BlogPost)
        .order_by(BlogPost.sort_order, BlogPost.published_at.desc(), BlogPost.id)
        .offset(offset)
        .limit(per_page)
    )
    rows = result.scalars().all()
    items = [
        BlogPostOut(
            id=r.id,
            title=r.title,
            description=r.description,
            image_url=public_media_url(r.image_path),
            external_url=r.external_url or "",
            published_at=r.published_at,
            sort_order=r.sort_order,
        )
        for r in rows
    ]
    return PaginatedBlog(
        items=items, total=total, page=page, per_page=per_page, pages=pages
    )
