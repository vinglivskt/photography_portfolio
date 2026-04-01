# Backend API

FastAPI + SQLAlchemy (async) + PostgreSQL. Схема БД версионируется через **Alembic** (миграции в `alembic/versions/`).

## Локальный запуск

1. Перейдите в каталог `backend`
2. Установите зависимости:

```bash
uv sync --group dev
```

3. Переменные окружения: корневой `.env` или `backend/.env` (`DATABASE_URL` с `+asyncpg` для приложения).
4. Применить миграции (sync-URL Alembic строится из того же `DATABASE_URL`, см. `app.config.Settings.database_url_sync`):

```bash
uv run alembic upgrade head
```

5. Запуск API:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Новая ревизия после изменения моделей

`DATABASE_URL` должен указывать на ваш PostgreSQL (как для приложения). При необходимости можно задать только для Alembic: `ALEMBIC_DATABASE_URL` (sync URL, `postgresql+psycopg2://...`).

```bash
uv run alembic revision --autogenerate -m "краткое описание"
```

Проверьте сгенерированный файл в `alembic/versions/` и при необходимости поправьте вручную.

### Уже существующая БД без `alembic_version`

Если таблицы созданы старым `create_all`, а структура совпадает с ревизией `337e37826129`, один раз пометьте текущее состояние:

```bash
uv run alembic stamp 337e37826129
```

Дальше — только `alembic upgrade head`.

## Тесты

Только **PostgreSQL**. `conftest.py` **всегда** выставляет `DATABASE_URL` для процесса pytest (не использует значение из `.env`, чтобы не смешивать с дев-базой). Свой URL: переменная **`PYTEST_DATABASE_URL`**.

По умолчанию:

`postgresql+asyncpg://portfolio_test:portfolio_test@127.0.0.1:5432/portfolio_test`

Перед прогоном поднимите контейнер, например:

```bash
docker run -d --name portfolio_test_pg -p 5432:5432 -e POSTGRES_USER=portfolio_test -e POSTGRES_PASSWORD=portfolio_test -e POSTGRES_DB=portfolio_test postgres:16-alpine
```

Либо: `PYTEST_DATABASE_URL=postgresql+asyncpg://... uv run pytest`.

Перед тестами автоматически выполняется `alembic upgrade head` (хук `pytest_sessionstart`).

## Docker

Образ API перед `uvicorn` выполняет `alembic upgrade head` от пользователя `app` (см. `docker-entrypoint.sh`).
