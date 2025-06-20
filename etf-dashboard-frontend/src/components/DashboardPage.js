import React, { useState, useEffect } from 'react';
import Header from '../layout/Header';
import ETFGrid from './ETFGrid';
import useCategories from '../hooks/useCategories';
import useEtfsByCategory from '../hooks/useEtfsByCategory';
import Filters from './Filters';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const { etfs, loading: etfLoading, error: etfError } = useEtfsByCategory(selectedCategory);
  const navigate = useNavigate();

  // Refresh NAV state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  useEffect(() => {
    if (categories.length > 0) setSelectedCategory(categories[0].key);
  }, [categories]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  const handleStatsClick = () => {
    // Flatten all funds for stats page
    const allEtfs = etfs
      ? etfs.map(fund => ({
          ...fund,
          category: selectedCategory
        }))
      : [];
    navigate('/ETFStats', { state: { etfs: allEtfs } });
  };

  const handleRefreshNavs = async () => {
    setRefreshing(true);
    setRefreshMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/fetch-navs', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to refresh NAV data');
      const data = await res.json();
      setRefreshMsg('NAV data refreshed! Please wait a few seconds for new data to load.');
      // Optionally, reload the page or refetch data here
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setRefreshMsg('Error refreshing NAV data.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="dashboard">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0', gap: 16 }}>
        <button
          style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #FF6B35 0%, #FFD23F 100%)', color: '#222', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          onClick={handleStatsClick}
        >
          ETF Stats
        </button>
        <button
          style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 8, border: 'none', background: refreshing ? '#FFD23F' : 'linear-gradient(90deg, #36D1C4 0%, #FFD23F 100%)', color: '#222', fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          onClick={handleRefreshNavs}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh NAV Data'}
        </button>
      </div>
      {refreshMsg && <div style={{ textAlign: 'center', color: '#28a745', marginBottom: 16 }}>{refreshMsg}</div>}
      <div style={{ marginBottom: 24 }}>
        <Filters
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryOptions={categories.map(cat => ({ value: cat.key, label: cat.label }))}
        />
      </div>
      {catLoading || etfLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : catError ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{catError.message || String(catError)}</div>
      ) : etfError ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{etfError.message || String(etfError)}</div>
      ) : (
        <ETFGrid etfs={etfs} categoryKey={selectedCategory} />
      )}
    </div>
  );
}

export default DashboardPage; 