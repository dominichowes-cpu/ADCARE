#!/usr/bin/env bash
# Apply all migrations in order. Requires DATABASE_URL.
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL first (see .env.example)}"
for f in db/migrations/*.sql; do
  echo "== $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done
echo "Migrations applied."
