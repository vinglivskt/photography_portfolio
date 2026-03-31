#!/bin/sh
set -e
UPLOAD="${UPLOAD_DIR:-/app/data/uploads}"
if [ "$(id -u)" = 0 ]; then
  mkdir -p "$UPLOAD/placeholders"
  chown -R app:app "$UPLOAD" 2>/dev/null || true
  if [ ! -f "$UPLOAD/placeholders/collection-1.svg" ]; then
    gosu app sh -c "cp /app/builtin/placeholders/*.svg \"$UPLOAD/placeholders/\"" 2>/dev/null || true
  fi
  exec gosu app "$@"
fi
exec "$@"
