import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/layout/Header';
import ETFGrid from '../components/etf/ETFGrid';
import useCategories from '../hooks/useCategories';
import useEtfsByCategory from '../hooks/useEtfsByCategory';
import Filters from '../components/etf/Filters';
import { useNavigate } from 'react-router-dom';
import { fetchLiveEtfs } from '../api/etfApi';

// Category keywords mapping for live filtering
const CATEGORY_KEYWORDS = {
  nifty50: ['nifty 50', 'niftybees', 'niftyetf', 'nifty bees'],
  banking: ['bank', 'banking', 'bankbees', 'nifty bank'],
  psuBanking: ['psu bank', 'psubnkbees'],
  privateBanking: ['private bank', 'pvt bank'],
  largeCap: ['largecap', 'top 100', 'nifty 100'],
  midCap: ['midcap', 'midcap 150', 'juniorbees'],
  smallCap: ['smallcap', 'small cap 250'],
  it: ['it', 'tech', 'nifty it', 'itbees'],
  sensex: ['sensex'],
  gold: ['gold', 'goldbees'],
  silver: ['silver', 'silverbees'],
  next50: ['nifty next 50', 'juniorbees'],
  liquid: ['liquid', 'liquidbees'],
  international: ['nasdaq', 'sp 500', 'international', 'global'],
  consumption: ['consumption', 'consumer'],
  healthcare: ['healthcare', 'pharma'],
  gilt: ['gsec', 'gilt', 'government bond'],
  momentum: ['momentum'],
  value: ['value'],
  quality: ['quality'],
  infrastructure: ['infra', 'infrastructure'],
  lowVolatility: ['low vol', 'lowvol'],
  equalWeight: ['equal weight', 'equalo'],
  metals: ['metal'],
  misc: [],
};

function filterLiveEtfsByCategory(liveEtfs, selectedCategory) {
  const keywords = CATEGORY_KEYWORDS[selectedCategory] || [];
  if (!keywords.length) return liveEtfs;
  return liveEtfs.filter(etf => {
    const name = ((etf.assets || '') + ' ' + (etf.symbol || '')).toLowerCase();
    return keywords.some(keyword => name.includes(keyword));
  });
}

function DashboardPage() {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const { etfs, loading: etfLoading, error: etfError } = useEtfsByCategory(selectedCategory);
  const navigate = useNavigate();

  // Refresh NAV state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  // Live toggle state
  const [live, setLive] = useState(false);
  const [liveEtfs, setLiveEtfs] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  useEffect(() => {
    if (categories.length > 0) setSelectedCategory(categories[0].key);
  }, [categories]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  // Fetch live ETF data when live is ON
  useEffect(() => {
    if (!live) return;
    setLiveLoading(true);
    setLiveError(null);
    fetchLiveEtfs()
      .then(data => setLiveEtfs(data.data || []))
      .catch(err => setLiveError(err.message || 'Failed to fetch live ETF data'))
      .finally(() => setLiveLoading(false));
  }, [live]);

  // Memoized filtered live ETFs for current category
  const filteredLiveEtfs = useMemo(() => {
    return live ? filterLiveEtfsByCategory(liveEtfs, selectedCategory) : [];
  }, [live, liveEtfs, selectedCategory]);

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
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setRefreshMsg('Error refreshing NAV data.');
    } finally {
      setRefreshing(false);
    }
  };

  // On category change in live mode, just re-filter (no need to re-fetch)
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // Optionally, re-fetch live data for freshness:
    // if (live) setLiveLoading(true); fetchLiveEtfs() ...
  };

  return (
    <div className="dashboard">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0', gap: 16, alignItems: 'center' }}>
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
        {/* Live Toggle Switch */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
          <span style={{ color: live ? '#28a745' : '#888' }}>Live</span>
          <input
            type="checkbox"
            checked={live}
            onChange={() => setLive(l => !l)}
            style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
          />
          <span style={{
            width: 44,
            height: 24,
            background: live ? 'linear-gradient(90deg, #28a745 0%, #FFD23F 100%)' : '#ccc',
            borderRadius: 16,
            position: 'relative',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute',
              left: live ? 22 : 2,
              top: 2,
              width: 20,
              height: 20,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              transition: 'left 0.2s',
              border: '1px solid #eee'
            }} />
          </span>
          <span style={{ color: live ? '#28a745' : '#888', marginLeft: 6 }}>{live ? 'ON' : 'OFF'}</span>
        </label>
      </div>
      {refreshMsg && <div style={{ textAlign: 'center', color: '#28a745', marginBottom: 16 }}>{refreshMsg}</div>}
      <div style={{ marginBottom: 24 }}>
        <Filters
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categoryOptions={categories.map(cat => ({ value: cat.key, label: cat.label }))}
        />
      </div>
      {live ? (
        liveLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading live data...</div>
        ) : liveError ? (
          <div style={{ color: 'red', textAlign: 'center', padding: 40 }}>{liveError}</div>
        ) : (
          <ETFGrid etfs={filteredLiveEtfs} live={true} />
        )
      ) : catLoading || etfLoading ? (
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