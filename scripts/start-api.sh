#!/usr/bin/env bash
# Start flashcard-learning-system FastAPI app (sibling repo).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$(cd "$ROOT/../flashcard-learning-system" && pwd)"
cd "$BACKEND"

# Prefer explicit shell overrides over .env defaults.
APP_PORT_OVERRIDE="${APP_PORT-}"
DB_AUTO_CREATE_SCHEMA_OVERRIDE="${DB_AUTO_CREATE_SCHEMA-}"
DB_AUTO_SEED_DATA_OVERRIDE="${DB_AUTO_SEED_DATA-}"
DATABASE_URL_OVERRIDE="${DATABASE_URL-}"
DB_URL_WRITER_OVERRIDE="${DB_URL_WRITER-}"
DB_URL_READER_OVERRIDE="${DB_URL_READER-}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -n "$APP_PORT_OVERRIDE" ]]; then
  export APP_PORT="$APP_PORT_OVERRIDE"
fi
if [[ -n "$DB_AUTO_CREATE_SCHEMA_OVERRIDE" ]]; then
  export DB_AUTO_CREATE_SCHEMA="$DB_AUTO_CREATE_SCHEMA_OVERRIDE"
fi
if [[ -n "$DB_AUTO_SEED_DATA_OVERRIDE" ]]; then
  export DB_AUTO_SEED_DATA="$DB_AUTO_SEED_DATA_OVERRIDE"
fi
if [[ -n "$DATABASE_URL_OVERRIDE" ]]; then
  export DATABASE_URL="$DATABASE_URL_OVERRIDE"
fi
if [[ -n "$DB_URL_WRITER_OVERRIDE" ]]; then
  export DB_URL_WRITER="$DB_URL_WRITER_OVERRIDE"
fi
if [[ -n "$DB_URL_READER_OVERRIDE" ]]; then
  export DB_URL_READER="$DB_URL_READER_OVERRIDE"
fi

export APP_PORT="${APP_PORT:-5001}"
export DB_AUTO_CREATE_SCHEMA="${DB_AUTO_CREATE_SCHEMA:-false}"
export DB_AUTO_SEED_DATA="${DB_AUTO_SEED_DATA:-false}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  export DB_URL_WRITER="${DB_URL_WRITER:-$DATABASE_URL}"
fi

if [[ -n "${DB_URL_WRITER:-}" ]]; then
  export DB_URL_READER="${DB_URL_READER:-$DB_URL_WRITER}"
fi

has_supabase_admin_auth_config() {
  [[ -n "${SUPABASE_URL:-}" ]] \
    && [[ -n "${SUPABASE_PUBLISHABLE_KEY:-}" ]] \
    && [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]
}

has_stable_discrete_db_config() {
  [[ -n "${DB_HOST_WRITER:-}" ]] \
    && [[ -n "${DB_NAME:-}" ]] \
    && [[ -n "${DB_USERNAME:-}" ]] \
    && [[ -n "${DB_PASSWORD:-}" ]]
}

is_placeholder_database_url() {
  [[ "${1:-}" == *"YOUR_DB_PASSWORD"* ]] \
    || [[ "${1:-}" == *"REPLACE_WITH_REAL_DB_PASSWORD"* ]]
}

uses_cli_login_runtime_credentials() {
  [[ "${1:-}" == *"cli_login_postgres"* ]]
}

PRIMARY_DB_URL="${DB_URL_WRITER:-${DATABASE_URL:-}}"

if [[ -n "$PRIMARY_DB_URL" ]] && is_placeholder_database_url "$PRIMARY_DB_URL"; then
  cat >&2 <<'EOF'
DATABASE_URL still contains a placeholder password.

Set `flashcard-learning-system/.env` to the Supabase session pooler DSN using the
real project database password, for example:

DATABASE_URL=postgresql+psycopg2://postgres.ynouixvprefkbscxldan:<real-db-password>@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
EOF
  exit 1
fi

if [[ -n "$PRIMARY_DB_URL" ]] && uses_cli_login_runtime_credentials "$PRIMARY_DB_URL"; then
  cat >&2 <<'EOF'
Refusing to start with `cli_login_postgres` runtime credentials.

Those credentials come from Supabase CLI flows and are temporary. Configure the
backend with the stable project password instead:

DATABASE_URL=postgresql+psycopg2://postgres.ynouixvprefkbscxldan:<real-db-password>@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
EOF
  exit 1
fi

if [[ -z "$PRIMARY_DB_URL" ]] && ! has_stable_discrete_db_config; then
  cat >&2 <<'EOF'
Missing stable database configuration.

Set `flashcard-learning-system/.env` with a stable DATABASE_URL for the Supabase
session pooler:

DATABASE_URL=postgresql+psycopg2://postgres.ynouixvprefkbscxldan:<real-db-password>@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

If you no longer know the database password, reset it in Supabase Database
Settings first. Do not use `cli_login_postgres` credentials from CLI commands as
the app runtime password.
EOF
  exit 1
fi

if ! has_supabase_admin_auth_config; then
  cat >&2 <<'EOF'
Missing Supabase backend admin auth configuration.

The backend now validates this on startup because study chat image/chart storage
and other server-side Supabase flows require backend-only admin credentials.

Set these in `flashcard-learning-system/.env`:

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

For FastAPI Cloud, set the same values as hosted environment variables:

uv run fastapi cloud env set SUPABASE_URL https://YOUR_PROJECT.supabase.co
uv run fastapi cloud env set SUPABASE_PUBLISHABLE_KEY ...
uv run fastapi cloud env set SUPABASE_SERVICE_ROLE_KEY ...
EOF
  exit 1
fi

export PYTHONPATH="$BACKEND/src${PYTHONPATH:+:$PYTHONPATH}"

if command -v uv >/dev/null 2>&1; then
  exec uv run flashcards-api
elif [[ -x .venv/bin/python ]]; then
  exec .venv/bin/python -m flashcards.backend.http.app
elif [[ -x venv/bin/python ]]; then
  exec venv/bin/python -m flashcards.backend.http.app
else
  exec python3 -m flashcards.backend.http.app
fi
