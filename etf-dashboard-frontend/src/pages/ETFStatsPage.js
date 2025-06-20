import React from 'react';
import { useLocation } from 'react-router-dom';
import ETFTable from '../components/common/ETFTable';

const DUMMY_ETFS = [
  { symbol: 'SBINIFTY', currentPrice: 120.00, high: 150.25, low: 95.75, fall: '20.1%', action: 'Neutral' },
  { symbol: 'NIFTYBEES', currentPrice: 180.00, high: 200.10, low: 120.50, fall: '10.0%', action: 'Buy' },
];

const ETFStatsPage = () => {
  const location = useLocation();
  const etfs = location.state?.etfs && location.state.etfs.length > 0 ? location.state.etfs : DUMMY_ETFS;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h2>ETF Stats</h2>
      <ETFTable etfs={etfs} />
    </div>
  );
};

export default ETFStatsPage; 