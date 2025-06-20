# 📈 ETF Dashboard

A robust, production-grade Indian ETF dashboard system with a Node.js backend and a React frontend.

---

## 🚀 One-Click Start (Recommended)

From the project root, use the provided scripts:

### 💻 Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

### 🪟 Windows
```
start start.bat
```

- These scripts will:
  - 🧑‍💻 Check for Node.js and npm
  - 📦 Install missing dependencies (backend and frontend)
  - 🟢 Start the backend (port 3001) and then the frontend (port 3000)
  - 🌐 Open the dashboard in your browser

---

## 🛠️ Manual Setup (Advanced)

### 🔙 Backend
```bash
cd backend
npm install
npm start
```

### 🔜 Frontend
```bash
cd etf-dashboard-frontend
npm install
npm start
```

---

## 🗂️ Project Structure

```
etf-dashboard/
├── backend/           # 🟢 Node.js/Express API
│   ├── server.js
│   ├── package.json
│   ├── nav_data/
│   │   └── etf_navs_categorized_YYYY-MM-DD.json
│   └── src/
│       ├── api/
│       │   └── etf/
│       │       ├── fetchNavs.js
│       │       ├── fetchNseEtfs.js
│       │       ├── getCategories.js
│       │       ├── getEtfList.js
│       │       ├── getEtfsByCategory.js
│       │       └── getNavBySchemeId.js
│       └── services/
│           ├── amfiNavService.js
│           └── navDataService.js
└── etf-dashboard-frontend/   # ⚛️ React app (user dashboard UI)
    ├── package.json
    └── src/
        ├── api/
        ├── components/
        │   ├── etf/
        │   └── layout/
        ├── hooks/
        ├── pages/
        ├── styles/
        ├── utils/
        └── App.js, index.js
```

---

## 🔌 API Endpoints

| Endpoint                                 | Method | Description                                 |
|-------------------------------------------|--------|---------------------------------------------|
| `/api/etfs`                              | GET    | 📊 Get all categorized ETFs                  |
| `/api/etfs/categories`                   | GET    | 🗂️ Get list of ETF categories                |
| `/api/etfs/category/:categoryKey`        | GET    | 📁 Get ETFs for a specific category          |
| `/api/nav?schemeId=...`                  | GET    | 💰 Get NAV for a specific scheme             |
| `/api/fetch-navs`                        | POST   | 🔄 Trigger NAV fetch/save (admin/refresh)    |
| `/api/etfs/live`                         | GET    | ⚡ Fetch live ETF data from NSE (Puppeteer)  |

---

## ✨ Frontend Features

- 🗂️ **Category Filter:** Browse ETFs by dynamically fetched categories.
- ⚡ **Live Toggle:** Instantly switch to live ETF prices from NSE.
- 🖼️ **Modern UI:** Responsive, glassmorphism dashboard with infinite scroll.
- 📊 **Stats Page:** View and compare ETF stats in a tabular format.
- 🔄 **Refresh Button:** Manually trigger backend NAV data refresh.
- ⏳ **Loading/Error Handling:** User-friendly spinners and error messages.
- 🏗️ **Production-Grade Structure:** Clean separation of concerns, modular code.

---

## 🏭 Development & Production

- 🟢 **Backend:** All business logic is in `src/`, with clear separation between API handlers and services.
- ⚛️ **Frontend:** All UI logic is in `src/`, with components, hooks, pages, and styles organized by domain.
- 🗃️ **Data:** Only the latest categorized ETF data is kept in `nav_data/`.

---

## 🛠️ Customization

- ➕ **Add new ETF categories:** Update the categorization logic in `amfiNavService.js`.
- 🔢 **Change default grid size:** Edit the `visibleCount` in `ETFGrid.js`.
- 🔧 **Change ports:** Set the `PORT` environment variable in backend or frontend.

---

## 🧰 Troubleshooting

- ❌ **Backend not starting?**  
  - Ensure Node.js v18+ is installed.
  - Check for missing dependencies: `npm install`
  - Check import paths if you move files.

- ❌ **Frontend not compiling?**  
  - Ensure all CSS imports use the correct path (`./styles/App.css`).
  - Check for missing dependencies: `npm install`

- ⚠️ **Live data not working?**  
  - Puppeteer may be blocked by NSE anti-bot. Try again or check logs.

---

## 📄 License

Apache License 2.0

---

**For any questions or contributions, please open an issue or pull request!**
