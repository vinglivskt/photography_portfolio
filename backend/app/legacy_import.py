"""
Импорт файлов из Django MEDIA (portfolio/images/) в UPLOAD_DIR и запись в БД.
Структура как в старом проекте: <media_root>/portfolio/images/*.jpg
"""

from __future__ import annotations

import asyncio
import logging
import re
import shutil
from datetime import date, timedelta
from pathlib import Path

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models import BlogPost, CollectionItem, SiteSettings
from app.seed import TELEGRAM_BOOKING, VK_PUBLIC

logger = logging.getLogger(__name__)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


def _legacy_images_dir(legacy_root: Path) -> Path | None:
    """Корень = каталог media из Django (внутри есть portfolio/images)."""
    direct = legacy_root / "portfolio" / "images"
    if direct.is_dir():
        return direct
    return None


def _natural_sort_key(path: Path) -> tuple:
    """Сортировка 1.jpg, 2.jpg, …, 10.jpg вместо лексикографической 1,10,2."""
    parts = re.split(r"(\d+)", path.name.lower())
    return tuple(int(p) if p.isdigit() else p for p in parts if p)


def _list_image_files(images_dir: Path) -> list[Path]:
    """Возвращает отсортированный список валидных файлов изображений."""
    files = [
        p
        for p in images_dir.iterdir()
        if p.is_file()
        and p.suffix.lower() in IMAGE_EXTENSIONS
        and not p.name.startswith(".")
    ]
    return sorted(files, key=_natural_sort_key)


def _theme_seed_files(images_dir: Path) -> list[Path]:
    """
    Демо-кадры из theme/static/images/{autor,photo}.
    Если есть прежняя схема имён (image_*, vlad*), берём её; иначе все файлы каталога.
    """
    candidates = _list_image_files(images_dir)
    preferred: list[Path] = []

    for p in candidates:
        name = p.name.lower()
        if name.startswith("image_") or name.startswith("vlad"):
            preferred.append(p)

    return preferred or candidates


def _copy_into_upload(sources: list[Path], upload_dir: Path) -> list[str]:
    """Копирует в upload_dir/portfolio/images/; возвращает относительные пути для БД."""
    rel_paths: list[str] = []
    for src in sources:
        rel = f"portfolio/images/{src.name}"
        dest = upload_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        rel_paths.append(rel)
    return rel_paths


def _copy_into_upload_tree(
    sources: list[Path], upload_dir: Path, root: Path
) -> list[str]:
    """
    Копирует с сохранением структуры подкаталогов относительно root.
    Пример: root/autor/a.jpg -> portfolio/images/autor/a.jpg
    """
    rel_paths: list[str] = []
    for src in sources:
        rel_from_root = src.relative_to(root).as_posix()
        rel = f"portfolio/images/{rel_from_root}"
        dest = upload_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        rel_paths.append(rel)
    return rel_paths


async def import_legacy_portfolio_if_configured(
    session: AsyncSession, settings: Settings
) -> None:
    """Импортирует legacy-медиа в uploads и создает записи коллекции/блога."""
    root_s = (settings.legacy_media_import_dir or "").strip()
    if not root_s:
        return

    legacy_root = Path(root_s)
    if not legacy_root.is_dir():
        logger.warning("LEGACY_MEDIA_IMPORT_DIR не найден или не каталог: %s", root_s)
        return

    images_dir = _legacy_images_dir(legacy_root)
    if not images_dir:
        logger.warning("Нет каталога portfolio/images в %s", legacy_root)
        return

    files = _list_image_files(images_dir)
    if not files:
        logger.info("В %s нет изображений", images_dir)
        return

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    try:
        rel_paths = _copy_into_upload(files, upload_dir)
    except OSError as e:
        logger.exception("Ошибка копирования в upload_dir: %s", e)
        return

    n_coll = await session.scalar(select(func.count()).select_from(CollectionItem)) or 0
    n_blog = await session.scalar(select(func.count()).select_from(BlogPost)) or 0

    if settings.force_legacy_media_reimport:
        await session.execute(delete(CollectionItem))
        await session.execute(delete(BlogPost))
        n_coll = 0
        n_blog = 0
        logger.info("FORCE_LEGACY_MEDIA_REIMPORT: очищены коллекция и блог")

    if n_coll == 0 and rel_paths:
        for i, rel in enumerate(rel_paths):
            session.add(
                CollectionItem(
                    title=f"Работа {i + 1}",
                    description="Из архива portfolio/images",
                    image_path=rel,
                    sort_order=(i + 1) * 10,
                )
            )
        logger.info("Импортировано в коллекцию: %s записей", len(rel_paths))

    if n_blog == 0 and rel_paths:
        titles = [
            "Съёмка и свет",
            "Подготовка к сессии",
            "За кадром",
        ]
        for j in range(min(3, len(rel_paths))):
            session.add(
                BlogPost(
                    title=titles[j] if j < len(titles) else f"Заметка {j + 1}",
                    description="Материал из вашего медиаархива (portfolio/images).",
                    image_path=rel_paths[j],
                    published_at=date.today() - timedelta(days=j),
                    sort_order=j + 1,
                )
            )
        logger.info("Созданы записи блога: %s", min(3, len(rel_paths)))

    result = await session.execute(
        select(SiteSettings).order_by(SiteSettings.id).limit(1)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = SiteSettings()
        session.add(row)

    if rel_paths:
        first, second = (
            rel_paths[0],
            rel_paths[1] if len(rel_paths) > 1 else rel_paths[0],
        )
        if not (row.hero_image_1 or "").strip() or _is_theme_static(row.hero_image_1):
            row.hero_image_1 = first
        if not (row.hero_image_2 or "").strip() or _is_theme_static(row.hero_image_2):
            row.hero_image_2 = second
        if not (row.about_image or "").strip() or _is_theme_static(row.about_image):
            row.about_image = first
        logger.info("Обновлены hero/about в site_settings из медиа")

    await session.commit()


async def import_theme_seed_if_configured(
    session: AsyncSession, settings: Settings
) -> None:
    """Сидирует БД изображениями темы при пустой коллекции и блоге."""
    root_s = (settings.static_seed_images_dir or "").strip()
    if not root_s:
        return

    root = Path(root_s)
    if not root.is_dir():
        logger.warning("STATIC_SEED_IMAGES_DIR не найден или не каталог: %s", root_s)
        return

    author_dir = root / "autor"
    photo_dir = root / "photo"
    if not author_dir.is_dir() or not photo_dir.is_dir():
        logger.warning(
            "Ожидаются папки autor и photo в %s (author=%s, photo=%s)",
            root,
            author_dir.is_dir(),
            photo_dir.is_dir(),
        )
        return

    author_files = _theme_seed_files(author_dir)
    photo_files = _theme_seed_files(photo_dir)
    if not author_files and not photo_files:
        logger.info("В %s/autor и %s/photo нет изображений для демо-сида", root, root)
        return

    n_coll = await session.scalar(select(func.count()).select_from(CollectionItem)) or 0
    n_blog = await session.scalar(select(func.count()).select_from(BlogPost)) or 0
    if n_coll > 0 and n_blog > 0:
        return

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    photo_rel_paths = _copy_into_upload_tree(photo_files, upload_dir, root) if photo_files else []
    author_rel_paths = _copy_into_upload_tree(author_files, upload_dir, root) if author_files else []

    if n_coll == 0 and photo_rel_paths:
        for i, rel in enumerate(photo_rel_paths):
            session.add(
                CollectionItem(
                    title=f"Кадр {i + 1}",
                    description="Демо-коллекция из папки photo",
                    image_path=rel,
                    sort_order=(i + 1) * 10,
                )
            )
        logger.info("Theme seed: коллекция заполнена из photo (%s)", len(photo_rel_paths))

    if n_blog == 0 and photo_rel_paths:
        bodies = [
            "Подготовка к съёмке: свет, локация и настроение. Этот кадр собирали без спешки, чтобы в кадре осталась естественная история.",
            "На площадке важно не торопить героя: даём привыкнуть к объективу и ловим живые жесты без шаблонных поз.",
            "После съёмки — отбор и аккуратная обработка: цвет и свет усиливают кадр, не перетягивая на себя внимание.",
        ]
        for j in range(min(3, len(photo_rel_paths))):
            session.add(
                BlogPost(
                    title=f"История кадра {j + 1}",
                    description="Коротко о дне съёмки и настроении кадра.",
                    body=bodies[j % len(bodies)],
                    image_path=photo_rel_paths[j],
                    published_at=date.today() - timedelta(days=j),
                    sort_order=j + 1,
                )
            )
        logger.info("Theme seed: блог заполнен из photo (%s)", min(3, len(photo_rel_paths)))

    result = await session.execute(select(SiteSettings).order_by(SiteSettings.id).limit(1))
    row = result.scalar_one_or_none()
    if row is None:
        row = SiteSettings()
        session.add(row)

    if author_rel_paths:
        first = author_rel_paths[0]
        second = author_rel_paths[1] if len(author_rel_paths) > 1 else author_rel_paths[0]
        if not (row.hero_image_1 or "").strip() or _is_theme_static(row.hero_image_1):
            row.hero_image_1 = first
        if not (row.hero_image_2 or "").strip() or _is_theme_static(row.hero_image_2):
            row.hero_image_2 = second
        if not (row.about_image or "").strip() or _is_theme_static(row.about_image):
            row.about_image = first
        if not row.author_image_paths:
            row.author_image_paths = list(author_rel_paths)

    if not (row.public_short_name or "").strip():
        row.public_short_name = "Влад"
    if not (row.vk_url or "").strip():
        row.vk_url = VK_PUBLIC
    if not (row.telegram_url or "").strip():
        row.telegram_url = TELEGRAM_BOOKING

    await session.commit()


def _is_theme_static(url: str) -> bool:
    """Проверяет, что путь указывает на встроенную тему, а не пользовательское медиа."""
    u = (url or "").strip()
    return u.startswith("/static/")


async def run_legacy_import_cli() -> None:
    """Точка входа: uv run python -m app.legacy_import"""
    from app.config import get_settings
    from app.database import AsyncSessionLocal

    s = get_settings()
    async with AsyncSessionLocal() as session:
        await import_legacy_portfolio_if_configured(session, s)


def main() -> None:
    """Запускает CLI-импорт legacy-медиа."""
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_legacy_import_cli())


if __name__ == "__main__":
    main()
