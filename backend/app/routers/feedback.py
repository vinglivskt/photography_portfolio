import asyncio
import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import FeedbackMessage
from app.schemas import FeedbackCreate, FeedbackOut
from app.services.email import send_feedback_notification

router = APIRouter(prefix="/feedback", tags=["feedback"])
_log = logging.getLogger(__name__)


def _client_ip(request: Request) -> str | None:
    """Извлекает IP клиента из proxy-заголовков или сокета."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
        return ip[:45] if ip else None
    if request.client:
        return request.client.host[:45]
    return None


@router.post("", response_model=FeedbackOut)
async def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Создает запись обратной связи и отправляет уведомление на почту."""
    ip = _client_ip(request)
    row = FeedbackMessage(
        subject=payload.subject,
        email=str(payload.email),
        content=payload.content,
        ip_address=ip,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    try:
        await asyncio.to_thread(
            send_feedback_notification,
            payload.subject,
            str(payload.email),
            payload.content,
            ip,
        )
    except Exception:
        _log.warning(
            "Не удалось отправить письмо с формы обратной связи", exc_info=True
        )
    return row
