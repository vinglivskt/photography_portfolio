from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utc_now() -> datetime:
    """Наивный UTC для колонок TIMESTAMP WITHOUT TIME ZONE (PostgreSQL/asyncpg)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class SiteSettings(Base):
    """Глобальные настройки сайта и контактные данные фотографа."""
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    photographer_name: Mapped[str] = mapped_column(String(200), default="")
    page_title: Mapped[str] = mapped_column(String(200), default="")
    tagline: Mapped[str] = mapped_column(String(500), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    signature: Mapped[str] = mapped_column(String(200), default="")
    about_image: Mapped[str] = mapped_column(String(500), default="")
    hero_image_1: Mapped[str] = mapped_column(String(500), default="")
    hero_image_2: Mapped[str] = mapped_column(String(500), default="")
    vk_url: Mapped[str] = mapped_column(String(500), default="")
    telegram_url: Mapped[str] = mapped_column(String(500), default="")
    instagram_url: Mapped[str] = mapped_column(String(500), default="")
    phone: Mapped[str] = mapped_column(String(100), default="")
    email_public: Mapped[str] = mapped_column(String(255), default="")
    address: Mapped[str] = mapped_column(String(500), default="")
    website_url: Mapped[str] = mapped_column(String(500), default="")
    counter_equipment: Mapped[int] = mapped_column(Integer, default=0)
    counter_studio: Mapped[int] = mapped_column(Integer, default=0)
    counter_sessions: Mapped[int] = mapped_column(Integer, default=0)
    counter_clients: Mapped[int] = mapped_column(Integer, default=0)
    instagram_section_title: Mapped[str] = mapped_column(String(200), default="")


class CollectionItem(Base):
    """Элемент публичной коллекции работ."""
    __tablename__ = "collection_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(500), default="")
    image_path: Mapped[str] = mapped_column(String(500))
    external_url: Mapped[str] = mapped_column(String(500), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utc_now)


class BlogPost(Base):
    """Публикация блога с обложкой и датой."""
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    image_path: Mapped[str] = mapped_column(String(500))
    external_url: Mapped[str] = mapped_column(String(500), default="")
    published_at: Mapped[date] = mapped_column(Date)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ServiceItem(Base):
    """Позиция списка услуг на сайте."""
    __tablename__ = "service_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    icon_class: Mapped[str] = mapped_column(String(100), default="flaticon-camera")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class FeedbackMessage(Base):
    """Сообщение, оставленное посетителем через форму обратной связи."""
    __tablename__ = "feedback_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utc_now)
