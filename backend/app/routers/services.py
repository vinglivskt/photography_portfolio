from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ServiceItem
from app.schemas import ServiceOut

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    """Возвращает список услуг в порядке сортировки."""
    result = await db.execute(
        select(ServiceItem).order_by(ServiceItem.sort_order, ServiceItem.id)
    )
    rows = result.scalars().all()
    return [
        ServiceOut(
            id=r.id,
            title=r.title,
            description=r.description,
            icon_class=r.icon_class,
            booking_url=r.booking_url or "",
            sort_order=r.sort_order,
        )
        for r in rows
    ]
