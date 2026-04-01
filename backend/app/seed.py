"""Первичное заполнение таблиц приложения безопасными значениями по умолчанию."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ServiceItem, SiteSettings

TELEGRAM_BOOKING = "https://t.me/mynightisall"
VK_PUBLIC = "https://vk.com/id183709684"


async def seed_if_empty(db: AsyncSession) -> None:
    """Создает стартовые записи настроек и услуг, если таблицы пусты."""
    n_settings = await db.scalar(select(func.count()).select_from(SiteSettings))
    if n_settings == 0:
        db.add(
            SiteSettings(
                photographer_name="Владислав Женилов",
                public_short_name="Влад",
                page_title="Zhenilov — портфолио",
                tagline="Свет и настроение в кадре\nПортреты, пары, события",
                hero_subtitle="Портреты, пары, события",
                bio=(
                    "Снимаю портреты, love story, мероприятия и коммерческие проекты. "
                    "Работаю с естественным светом и в студии, помогаю с позированием и настроением кадра."
                ),
                signature="Влад",
                about_image="",
                hero_image_1="",
                hero_image_2="",
                vk_url=VK_PUBLIC,
                telegram_url=TELEGRAM_BOOKING,
                instagram_url="",
                phone="",
                email_public="",
                address="",
                website_url="",
                counter_equipment=120,
                counter_studio=150,
                counter_sessions=200,
                counter_clients=200,
                instagram_section_title="Последние съёмки",
                author_image_paths=[],
            )
        )
        await db.commit()

    n_services = await db.scalar(select(func.count()).select_from(ServiceItem))
    if n_services == 0:
        db.add_all(
            [
                ServiceItem(
                    title="Портретная съемка",
                    description="Индивидуальные и семейные портреты, подбор локации и света.",
                    icon_class="flaticon-big-lens",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=10,
                ),
                ServiceItem(
                    title="Печать и ретушь",
                    description="Обработка снимков, подготовка к печати и альбомам.",
                    icon_class="flaticon-printing-photo",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=20,
                ),
                ServiceItem(
                    title="Коммерция",
                    description="Предметная съемка, контент для брендов и соцсетей.",
                    icon_class="flaticon-focusing-target",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=30,
                ),
                ServiceItem(
                    title="Студия",
                    description="Съемка в студии с реквизитом и светом.",
                    icon_class="flaticon-camera",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=40,
                ),
                ServiceItem(
                    title="Love story",
                    description="Прогулочные и постановочные истории для пар.",
                    icon_class="flaticon-polaroid-pictures",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=50,
                ),
                ServiceItem(
                    title="Мероприятия",
                    description="Корпоративы, концерты, отчетная съемка.",
                    icon_class="flaticon-film",
                    booking_url=TELEGRAM_BOOKING,
                    sort_order=60,
                ),
            ]
        )
        await db.commit()


async def patch_degenerate_site_settings(db: AsyncSession) -> None:
    """
    Строка настроек без имени, био и с нулевыми счётчиками — подставляем демо-тексты
    (часто после сбоя деплоя, когда сид не создал полноценную запись).
    """
    result = await db.execute(select(SiteSettings).order_by(SiteSettings.id).limit(1))
    row = result.scalar_one_or_none()
    if row is None:
        return
    if (row.photographer_name or "").strip():
        return
    if (row.bio or "").strip():
        return
    if any(
        (
            row.counter_equipment,
            row.counter_studio,
            row.counter_sessions,
            row.counter_clients,
        )
    ):
        return
    row.photographer_name = "Владислав Женилов"
    row.public_short_name = "Влад"
    row.page_title = "Zhenilov — портфолио"
    row.tagline = "Свет и настроение в кадре\nПортреты, пары, события"
    row.hero_subtitle = "Портреты, пары, события"
    row.bio = (
        "Снимаю портреты, love story, мероприятия и коммерческие проекты. "
        "Работаю с естественным светом и в студии, помогаю с позированием и настроением кадра."
    )
    row.signature = "Влад"
    row.counter_equipment = 120
    row.counter_studio = 150
    row.counter_sessions = 200
    row.counter_clients = 200
    row.instagram_section_title = "Последние съёмки"
    if not (row.vk_url or "").strip():
        row.vk_url = VK_PUBLIC
    if not (row.telegram_url or "").strip():
        row.telegram_url = TELEGRAM_BOOKING
    await db.commit()
