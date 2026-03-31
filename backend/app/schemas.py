from datetime import date, datetime
from typing import List

from pydantic import BaseModel, EmailStr, Field


class SiteSettingsOut(BaseModel):
    """Публичная схема настроек сайта."""
    photographer_name: str
    page_title: str
    tagline: str
    bio: str
    signature: str
    about_image: str
    hero_image_1: str
    hero_image_2: str
    vk_url: str
    telegram_url: str
    instagram_url: str
    phone: str
    email_public: str
    address: str
    website_url: str
    counter_equipment: int
    counter_studio: int
    counter_sessions: int
    counter_clients: int
    instagram_section_title: str

    model_config = {"from_attributes": True}


class CollectionOut(BaseModel):
    """Схема одной карточки коллекции."""
    id: int
    title: str
    description: str
    image_url: str
    external_url: str
    sort_order: int

    model_config = {"from_attributes": True}


class BlogPostOut(BaseModel):
    """Схема одной записи блога."""
    id: int
    title: str
    description: str
    image_url: str
    external_url: str
    published_at: date
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceOut(BaseModel):
    """Схема одной услуги."""
    id: int
    title: str
    description: str
    icon_class: str
    sort_order: int

    model_config = {"from_attributes": True}


class PaginatedCollections(BaseModel):
    """Ответ API со страницей коллекций."""
    items: List[CollectionOut]
    total: int
    page: int
    per_page: int
    pages: int


class PaginatedBlog(BaseModel):
    """Ответ API со страницей блога."""
    items: List[BlogPostOut]
    total: int
    page: int
    per_page: int
    pages: int


class FeedbackCreate(BaseModel):
    """Входные данные формы обратной связи."""
    subject: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    content: str = Field(..., min_length=1, max_length=8000)


class FeedbackOut(BaseModel):
    """Результат создания сообщения обратной связи."""
    id: int
    subject: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
