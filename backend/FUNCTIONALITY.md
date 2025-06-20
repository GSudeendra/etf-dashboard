# ETF Dashboard - Functionality Overview

This document describes the main features and functionality of the ETF Dashboard application (backend and frontend).

---

## Core Functionality

### 1. Automated ETF Data Fetching & Categorization
- Fetches the latest Indian ETF data from AMFI (NAVAll.txt) and mfapi.in.
- Dynamically identifies and categorizes ETFs using keywords and rules.
- Filters out "Regular" and "IDCW" variants for clean data.
- Saves the categorized ETF data as a single JSON file (one per day) in `backend/nav_data/`.

### 2. Robust API Backend (Node.js/Express)
- Modular API endpoints for:
  - Listing all categorized ETFs
  - Listing all ETF categories
  - Listing ETFs by category
  - Fetching NAV for a specific scheme
  - Triggering a manual NAV data refresh
  - Fetching live ETF data from NSE (using Puppeteer)
- In-memory caching and auto-refresh if data is missing or outdated.
- Error handling and logging for all endpoints.

### 3. Live ETF Data (NSE Scraping)
- Uses Puppeteer to fetch live ETF prices and stats from NSE.
- Handles anti-bot measures and errors gracefully.
- Provides a separate endpoint for live data, used by the frontend's "Live" mode.

### 4. Modern React Frontend
- Fetches categories and ETFs from backend APIs.
- Category filter and infinite scroll for ETF grid.
- "Live" toggle to instantly switch to live prices (with pulsing indicator).
- Responsive, modern UI with glassmorphism and clean UX.
- Stats page for tabular ETF comparison.
- Manual "Refresh NAV Data" button for admins.
- Loading spinners and error alerts for all data fetches.

### 5. Production-Grade Code Structure
- Backend: All logic in `src/` (API, services, utils), clean separation of concerns.
- Frontend: All logic in `src/` (components, hooks, pages, styles, utils), grouped by domain.
- No hardcoded ETF lists or legacy data sources.
- Easy to extend, maintain, and debug.

---

## User Flow
1. **User opens the dashboard:**
   - Sees a list of ETF categories and the ETFs in the first category.
2. **User selects a category:**
   - ETF grid updates to show only ETFs in that category.
3. **User toggles "Live" mode:**
   - Instantly sees live prices and stats for ETFs in the selected category.
4. **User clicks "ETF Stats":**
   - Navigates to a stats page for tabular comparison.
5. **User/admin clicks "Refresh NAV Data":**
   - Triggers backend to fetch and save the latest ETF NAV data.

---

## For Developers
- All business logic is modular and testable.
- Add new categories or change logic in `amfiNavService.js`.
- Add new UI features by extending React components/hooks.
- All API endpoints are documented in the main README.

---

**This document is intended as a quick reference for future development, onboarding, and debugging.** 