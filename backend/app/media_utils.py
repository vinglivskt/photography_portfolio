def public_media_url(stored_path: str) -> str:
    """Нормализует путь из БД в публичный URL медиа."""
    if not stored_path:
        return ""
    p = stored_path.strip()
    if p.startswith(("http://", "https://")):
        return p
    if p.startswith("/static/"):
        return p
    if p.startswith("/media/"):
        return p
    return f"/media/{p.lstrip('/')}"
