import { useState, useEffect } from 'react';
import { fetchEtfsByCategory } from '../api/etfApi';

export default function useEtfsByCategory(categoryKey) {
  const [etfs, setEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryKey) return;
    setLoading(true);
    fetchEtfsByCategory(categoryKey)
      .then(data => setEtfs(data.funds || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [categoryKey]);

  return { etfs, loading, error };
} 