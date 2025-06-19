# Indian ETF Dashboard

A full-stack web application for live Indian ETF analytics, built with React (frontend) and Node.js/Express (backend).

---

## Project Structure

```
etf-dashboard/
  backend/                  # Node.js/Express API server (fetches live ETF data from NSE)
  etf-dashboard-frontend/   # React app (user dashboard UI)
```

---

## Setup & Run

### 1. Backend (API Server)
```bash
cd backend
npm install
npm start
```
- Runs on http://localhost:3001

### 2. Frontend (React App)
```bash
cd ../etf-dashboard-frontend
npm install
npm start
```
- Runs on http://localhost:3000
- Fetches data from backend API

---

## Features
- Live ETF prices, analytics, and moving averages
- Category, recommendation, and price filters
- Modular, maintainable React codebase
- Async per-card data loading for smooth UX

---

## Clean Code & Modularity
- All business logic and API calls are separated into modules
- No unused boilerplate files
- Each part (backend/frontend) can be developed and deployed independently

---

## Customization
- To add more ETF categories or symbols, update `backend/server.js` and `etf-dashboard-frontend/src/constants.js`
- For custom branding, add your own logo/favicon in `public/`

---

## License
Apache 2.0 
