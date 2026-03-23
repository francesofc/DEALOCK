#!/bin/bash
# ============================================
# DEALOCK E2E TEST SERVER STARTER
# ============================================
# 
# Usage: ./scripts/start-e2e-server.sh
# 
# This script:
# 1. Kills any existing server on port 3000
# 2. Builds the production app with test mode
# 3. Starts the server with proper env vars
# 4. Waits for server to be ready
# ============================================

set -e

echo "[E2E] Starting test server preparation..."

# Kill any existing server on port 3000
echo "[E2E] Cleaning up existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Build with test mode enabled
echo "[E2E] Building production app with TEST_MODE=true..."
NEXT_PUBLIC_TEST_MODE=true npm run build

# Start the server
echo "[E2E] Starting server..."
NEXT_PUBLIC_TEST_MODE=true npm start > /tmp/dealock-e2e-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo "[E2E] Waiting for server to be ready..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "[E2E] Server ready at http://localhost:3000"
    echo "[E2E] Server PID: $SERVER_PID"
    echo "[E2E] Logs: tail -f /tmp/dealock-e2e-server.log"
    exit 0
  fi
  sleep 1
done

echo "[E2E] ERROR: Server failed to start within 30 seconds"
kill $SERVER_PID 2>/dev/null || true
exit 1
