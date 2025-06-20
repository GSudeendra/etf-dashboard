@echo off
setlocal enabledelayedexpansion

REM 1. Check for node and npm
where node >nul 2>nul || (echo Error: node is not installed. & exit /b 1)
where npm >nul 2>nul || (echo Error: npm is not installed. & exit /b 1)

REM 2. Start backend
cd backend
if not exist node_modules (echo Installing backend dependencies... & npm install)
if exist package-lock.json if not exist node_modules (npm install)
echo Starting backend...
start "ETF Backend" cmd /k "npm start"

REM 3. Start frontend
cd ..\etf-dashboard-frontend
if not exist node_modules (echo Installing frontend dependencies... & npm install)
if exist package-lock.json if not exist node_modules (npm install)
echo Starting frontend...
start "ETF Frontend" cmd /k "npm start"

REM 4. Open frontend in browser
start http://localhost:3000

cd ..
echo ETF Dashboard started! Backend (port 3001), Frontend (port 3000).
echo To stop: close the opened terminal windows. 