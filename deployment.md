# Развёртывание на сервере

## Минимальный стек (Nginx на хосте)

1. Установите Docker и Docker Compose v2.
2. Клонируйте репозиторий, создайте `.env` из `env.example`: задайте `POSTGRES_PASSWORD`, `CORS_ORIGINS` с вашим HTTPS-ориджином, при необходимости `HTTP_PORT` (если порт 80 занят — например `8080`).
3. Подготовьте `legacy_media` или `LEGACY_MEDIA_BIND` по основному README.
4. Запуск: `docker compose -f docker-compose.yml -f docker-compose.http.yml up -d --build`.
5. Проверка: главная, `/api/health`, `/docs`, загрузка `/media/...`.

API не публикуется на хост — доступ снаружи только через Nginx (порт `HTTP_PORT`).

## Traefik и Let’s Encrypt

1. В `.env`: `ACME_EMAIL`, `TRAEFIK_DOMAIN` (тот же хост, что в `CORS_ORIGINS`), надёжный `POSTGRES_PASSWORD`.
2. Команда: `docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build`.
3. Убедитесь, что DNS A-запись домена указывает на сервер и порты 80/443 открыты.

## CI/CD

В репозитории включён GitHub Actions (`.github/workflows/ci.yml`): pytest, Vitest, проверка `docker compose config`.

CD не привязан к конкретному хостингу: типичный вариант — отдельный workflow по `workflow_dispatch` или тегу, который по SSH выполняет `git pull` и `docker compose -f docker-compose.yml -f docker-compose.http.yml up -d --build` (или с `docker-compose.traefik.yml` для HTTPS), либо публикация образов в registry и `pull` на сервере. После смены `POSTGRES_PASSWORD` на уже заполненном volume пароль в контейнере PostgreSQL не обновится — меняйте пароль вручную в БД или пересоздайте volume (данные пропадут).
