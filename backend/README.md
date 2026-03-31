# Backend API

FastAPI + SQLAlchemy (async) + PostgreSQL.

## Локальный запуск

1. Перейдите в каталог `backend`
2. Установите зависимости:

```bash
uv sync --group dev
```

3. Подготовьте переменные окружения:
   - основной файл проекта: корневой `.env`
   - для локального запуска без Docker можно использовать `backend/.env`
4. Запустите API:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Тесты

```bash
uv run pytest
```
