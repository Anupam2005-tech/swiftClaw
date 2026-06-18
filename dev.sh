#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting swiftClaw development servers..."
echo ""

# Kill existing servers
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start backend
echo "[1/2] Starting backend (port 8000)..."
cd "$SCRIPT_DIR/swiftClaw_v2_backend"
setsid python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 < /dev/null > /tmp/swiftclaw-backend.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Start frontend
echo "[2/2] Starting frontend (port 3000)..."
cd "$SCRIPT_DIR/frontend/web"
setsid npx next dev < /dev/null > /tmp/swiftclaw-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "Servers starting..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/swiftclaw-backend.log"
echo "  Frontend: tail -f /tmp/swiftclaw-frontend.log"
echo ""
echo "Stop all: pkill -f 'uvicorn app.main' && pkill -f 'next dev'"
