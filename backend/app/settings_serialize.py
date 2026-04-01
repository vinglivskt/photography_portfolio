"""Сборка публичного ответа настроек из строки ORM."""

import json

from app.media_utils import public_media_url
from app.models import SiteSettings
from app.schemas import SiteSettingsOut


def author_image_urls(row: SiteSettings) -> list[str]:
    raw = row.author_image_paths
    if raw is None:
        return []
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return []
    if not isinstance(raw, list):
        return []
    return [public_media_url(str(p)) for p in raw if str(p).strip()]


def site_settings_to_out(row: SiteSettings) -> SiteSettingsOut:
    return SiteSettingsOut(
        photographer_name=row.photographer_name,
        page_title=row.page_title,
        tagline=row.tagline,
        bio=row.bio,
        signature=row.signature,
        about_image=public_media_url(row.about_image),
        hero_image_1=public_media_url(row.hero_image_1),
        hero_image_2=public_media_url(row.hero_image_2),
        vk_url=row.vk_url,
        telegram_url=row.telegram_url,
        instagram_url=row.instagram_url,
        phone=row.phone,
        email_public=row.email_public,
        address=row.address,
        website_url=row.website_url,
        counter_equipment=row.counter_equipment,
        counter_studio=row.counter_studio,
        counter_sessions=row.counter_sessions,
        counter_clients=row.counter_clients,
        instagram_section_title=row.instagram_section_title,
        public_short_name=row.public_short_name,
        hero_subtitle=row.hero_subtitle,
        author_images=author_image_urls(row),
    )
