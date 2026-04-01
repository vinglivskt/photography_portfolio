#!/bin/sh
set -e
UPLOAD="${UPLOAD_DIR:-/app/data/uploads}"
MIGRATE_LOCK="$UPLOAD/.alembic.lock"

if [ "$(id -u)" = 0 ]; then
  mkdir -p "$UPLOAD/placeholders"
  chown -R app:app "$UPLOAD" 2>/dev/null || true
  touch "$MIGRATE_LOCK" 2>/dev/null || true
  chown app:app "$MIGRATE_LOCK" 2>/dev/null || true
  if [ ! -f "$UPLOAD/placeholders/collection-1.svg" ]; then
    gosu app sh -c "cp /app/builtin/placeholders/*.svg \"$UPLOAD/placeholders/\"" 2>/dev/null || true
  fi
  if command -v flock >/dev/null 2>&1; then
    flock -w 300 "$MIGRATE_LOCK" gosu app sh -c "cd /app && alembic upgrade head"
  else
    gosu app sh -c "cd /app && alembic upgrade head"
  fi
  exec gosu app "$@"
fi

if command -v flock >/dev/null 2>&1; then
  flock -w 300 "$MIGRATE_LOCK" sh -c "cd /app && alembic upgrade head"
else
  cd /app && alembic upgrade head
fi
exec "$@"
