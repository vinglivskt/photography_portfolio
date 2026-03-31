# Портфолио фотографа

Продакшен-стек: React (Vite build) + FastAPI + PostgreSQL + Nginx + Docker Compose.

## Быстрый старт для деплоя

1. Скопируйте шаблон переменных:
   - `cp env.example .env`
2. Обязательно заполните в `.env`:
   - `POSTGRES_PASSWORD`
   - `DATABASE_URL`
   - `CORS_ORIGINS` (ваш домен/домены)
3. Запустите сервисы:

```bash
docker compose up -d --build
```

4. Проверка после запуска:
   - `GET /api/health`
   - `GET /api/health/ready`
   - открывается главная страница

## Переменные окружения

Все runtime-настройки вынесены в корневой `.env`.
Шаблон: `env.example`.

Ключевые группы переменных:
- база данных: `POSTGRES_*`, `DATABASE_URL`
- сеть: `HTTP_PORT`, `CORS_ORIGINS`
- медиа: `UPLOAD_DIR`, `LEGACY_MEDIA_*`, `STATIC_SEED_IMAGES_DIR`
- обратная связь: `SMTP_*`, `FEEDBACK_*`
- TLS (Traefik): `TRAEFIK_DOMAIN`, `ACME_EMAIL`

## Импорт legacy-медиа

Если у вас есть старый каталог `media/portfolio/images`, подключите его через:
- `LEGACY_MEDIA_BIND` (bind mount в Docker)
- `LEGACY_MEDIA_IMPORT_DIR=/legacy_media`

API при старте может импортировать изображения и заполнить базовые сущности.
Для принудительного переимпорта используйте:
- `FORCE_LEGACY_MEDIA_REIMPORT=true` на один запуск, затем верните `false`

## Безопасность

- Внешне доступен только Nginx (`HTTP_PORT`)
- Контейнер API не публикует порт наружу
- В Nginx включены заголовки `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Секреты и пароли не хранятся в коде и задаются через `.env`

## Локальная разработка без Docker

- backend: `cd backend && uv sync --group dev && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- frontend: `cd frontend && npm install && npm run dev`

## Тесты

- backend: `cd backend && uv run pytest`
- frontend: `cd frontend && npm test`
