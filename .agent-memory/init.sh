#!/bin/bash
set -euo pipefail

# Install dependencies if node_modules missing
if [[ ! -d node_modules ]]; then
  npm install 2>/dev/null || true
fi

# Start dev server in background if not already running
if ! lsof -i :3000 -sTCP:LISTEN > /dev/null 2>&1; then
  npm run dev &
  sleep 3
fi

echo "Agent memory environment ready"
