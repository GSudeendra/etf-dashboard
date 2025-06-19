import { useState, useEffect } from 'react';
import { ETF_SYMBOLS_BY_CATEGORY } from '../constants';
import { fetchETF, fetchETFsByCategory } from '../api/etfApi';

export default function useETFs(category) {
  const [etfs, setETFs] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const symbols = ETF_SYMBOLS_BY_CATEGORY[category] || [];
    setETFs(symbols.map(symbol => ({ symbol })));
    setLoadingMap(Object.fromEntries(symbols.map(s => [s, true])));
    setLastUpdate(null);
    Promise.all(symbols.map(async symbol => {
      try {
        const etf = await fetchETF(symbol);
        setETFs(prev => prev.map(e => e.symbol === symbol ? etf : e));
      } catch (e) {
        setETFs(prev => prev.map(e => e.symbol === symbol ? { symbol, name: symbol, description: 'Failed to load data' } : e));
      } finally {
        setLoadingMap(prev => ({ ...prev, [symbol]: false }));
      }
    })).then(() => setLastUpdate(new Date()));
  }, [category]);

  return { etfs, loadingMap, lastUpdate };
}

export function useETFsByCategory() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchETFsByCategory()
      .then(res => setData(res))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
} 