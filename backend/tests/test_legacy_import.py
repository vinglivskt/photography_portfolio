"""Синхронная часть импорта (без БД)."""

from pathlib import Path

from app.legacy_import import (
    IMAGE_EXTENSIONS,
    _copy_into_upload,
    _legacy_images_dir,
    _list_image_files,
)


def test_legacy_images_dir(tmp_path: Path) -> None:
    assert _legacy_images_dir(tmp_path) is None
    img_dir = tmp_path / "portfolio" / "images"
    img_dir.mkdir(parents=True)
    assert _legacy_images_dir(tmp_path) == img_dir


def test_list_and_copy(tmp_path: Path) -> None:
    img_dir = tmp_path / "legacy" / "portfolio" / "images"
    img_dir.mkdir(parents=True)
    (img_dir / "b.jpg").write_bytes(b"1")
    (img_dir / "a.jpg").write_bytes(b"2")
    (img_dir / "skip.txt").write_text("x")
    files = _list_image_files(img_dir)
    assert [p.name for p in files] == ["a.jpg", "b.jpg"]

    upload = tmp_path / "upload"
    rels = _copy_into_upload(files, upload)
    assert rels == ["portfolio/images/a.jpg", "portfolio/images/b.jpg"]
    assert (upload / "portfolio" / "images" / "a.jpg").read_bytes() == b"2"


def test_image_extensions_covers_common() -> None:
    assert ".jpeg" in IMAGE_EXTENSIONS
    assert ".png" in IMAGE_EXTENSIONS
