#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

function check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo -e "${RED}Error: $1 is not installed.${NC}"; exit 1; }
}

# 1. Check for node and npm
check_cmd node
check_cmd npm

# 2. Start backend
cd backend
echo -e "${GREEN}==> Starting backend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing backend dependencies...${NC}"
  npm install
fi
npm run start &
BACKEND_PID=$!
sleep 5

# 3. Start frontend
cd ../etf-dashboard-frontend
echo -e "${GREEN}==> Starting frontend...${NC}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo -e "${GREEN}Installing frontend dependencies...${NC}"
  npm install
fi
npm start &
FRONTEND_PID=$!
sleep 5

# 4. Open frontend in browser
if command -v open >/dev/null; then
  open http://localhost:3000
elif command -v xdg-open >/dev/null; then
  xdg-open http://localhost:3000
fi

cd ..
echo -e "${GREEN}ETF Dashboard started! Backend (port 3001), Frontend (port 3000).${NC}"
echo -e "${GREEN}To stop: kill $BACKEND_PID $FRONTEND_PID${NC}"
wait $BACKEND_PID $FRONTEND_PID 