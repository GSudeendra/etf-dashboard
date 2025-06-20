import { useState, useEffect } from 'react';
import { fetchCategories } from '../api/etfApi';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
} 