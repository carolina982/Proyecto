#!/usr/bin/env bash
# Dump local de Mongo. No va a git (backend/~/ y *.archive están en .gitignore).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi
URI="${MONGO_URI:-mongodb://127.0.0.1:27017/voltaDB}"
OUT="${BACKUP_DIR:-$ROOT/~/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$OUT/volta-$STAMP"
mkdir -p "$OUT"
echo "Dump → $DEST"
mongodump --uri="$URI" --out="$DEST"
KEEP="$(ls -1dt "$OUT"/volta-* 2>/dev/null | tail -n +15 || true)"
if [[ -n "$KEEP" ]]; then
  echo "$KEEP" | while IFS= read -r dir; do
    [[ -d "$dir" ]] || continue
    echo "Elimina dump viejo $dir"
    rm -rf "$dir"
  done
fi
echo "Listo. Revisa el disco; estos dumps no se suben a GitHub."
