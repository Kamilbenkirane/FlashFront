#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXPO_PORT="${EXPO_PORT:-8081}"
API_PORT="${APP_PORT:-5001}"

kill_port() {
  local port="$1"
  local label="$2"
  local pids

  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return
  fi

  echo "Stopping $label on port $port..."
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done

  local attempts=0
  while lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [[ "$attempts" -ge 20 ]]; then
      echo "Force stopping $label on port $port..."
      for pid in $(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do
        kill -9 "$pid" 2>/dev/null || true
      done
      break
    fi
    sleep 0.25
  done
}

kill_port "$API_PORT" "backend"
kill_port "$EXPO_PORT" "Expo/Metro"

cd "$ROOT"
exec bunx concurrently -n api,expo -c blue,green \
  "bash scripts/start-api.sh" \
  "bunx expo start --localhost --ios --go --clear"
