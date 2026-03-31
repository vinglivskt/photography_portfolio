"""Первичное заполнение таблиц приложения безопасными значениями по умолчанию."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ServiceItem, SiteSettings


async def seed_if_empty(db: AsyncSession) -> None:
    """Создает стартовые записи настроек и услуг, если таблицы пусты."""
    n_settings = await db.scalar(select(func.count()).select_from(SiteSettings))
    if n_settings == 0:
        db.add(
            SiteSettings(
                photographer_name="Фотограф",
                page_title="Портфолио фотографа",
                tagline="Фотограф\nСнимаю портреты, истории и события",
                bio=(
                    "Снимаю портреты, love story, мероприятия и коммерческие проекты. "
                    "Работаю с естественным светом и в студии, помогаю с позированием и настроением кадра."
                ),
                signature="Фотограф",
                about_image="",
                hero_image_1="",
                hero_image_2="",
                vk_url="",
                telegram_url="",
                instagram_url="",
                phone="",
                email_public="",
                address="",
                website_url="",
                counter_equipment=120,
                counter_studio=150,
                counter_sessions=200,
                counter_clients=200,
                instagram_section_title="Follow me on Instagram",
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
                    sort_order=10,
                ),
                ServiceItem(
                    title="Печать и ретушь",
                    description="Обработка снимков, подготовка к печати и альбомам.",
                    icon_class="flaticon-printing-photo",
                    sort_order=20,
                ),
                ServiceItem(
                    title="Коммерция",
                    description="Предметная съемка, контент для брендов и соцсетей.",
                    icon_class="flaticon-focusing-target",
                    sort_order=30,
                ),
                ServiceItem(
                    title="Студия",
                    description="Съемка в студии с реквизитом и светом.",
                    icon_class="flaticon-camera",
                    sort_order=40,
                ),
                ServiceItem(
                    title="Love story",
                    description="Прогулочные и постановочные истории для пар.",
                    icon_class="flaticon-polaroid-pictures",
                    sort_order=50,
                ),
                ServiceItem(
                    title="Мероприятия",
                    description="Корпоративы, концерты, отчетная съемка.",
                    icon_class="flaticon-film",
                    sort_order=60,
                ),
            ]
        )
        await db.commit()
