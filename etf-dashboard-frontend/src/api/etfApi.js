// API utility for ETF Dashboard

const BASE_URL = 'http://localhost:3001';

export async function fetchETF(symbol) {
  const res = await fetch(`${BASE_URL}/api/etf?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('Failed to fetch ETF data');
  return await res.json();
}

export async function fetchMovingAverages(symbol) {
  const res = await fetch(`${BASE_URL}/api/etf-ma/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('Failed to fetch moving averages');
  return await res.json();
}

export async function fetchETFsByCategory() {
  const res = await fetch(`${BASE_URL}/api/etfs-by-category`);
  if (!res.ok) throw new Error('Failed to fetch ETFs by category');
  return await res.json();
}

export async function fetchTopLiquidETFs() {
  const res = await fetch(`${BASE_URL}/api/etfs/top-liquid`);
  if (!res.ok) throw new Error('Failed to fetch top liquid ETFs');
  return await res.json();
}

export async function fetchOtherETFs() {
  const res = await fetch(`${BASE_URL}/api/etfs/others`);
  if (!res.ok) throw new Error('Failed to fetch other ETFs');
  return await res.json();
}

// New APIs for the organized ETF categories

export async function fetchETFCategories() {
  const res = await fetch(`${BASE_URL}/api/etf-categories`);
  if (!res.ok) throw new Error('Failed to fetch ETF categories structure');
  return await res.json();
}

export async function fetchETFsByStructuredCategory(categoryKey) {
  const res = await fetch(`${BASE_URL}/api/etf-category/${encodeURIComponent(categoryKey)}`);
  if (!res.ok) throw new Error(`Failed to fetch ETFs for category ${categoryKey}`);
  return await res.json();
}

export async function fetchETFCategoryKeys() {
  const res = await fetch(`${BASE_URL}/api/etf-category-keys`);
  if (!res.ok) throw new Error('Failed to fetch ETF category keys');
  return await res.json();
}
