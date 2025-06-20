import React from 'react';
import { useLocation } from 'react-router-dom';

const ETFStatsPage = () => {
  const location = useLocation();
  const etfs = location.state?.etfs && location.state.etfs.length > 0 ? location.state.etfs : [];

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h2>ETF Stats</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #eee' }}>ETF Symbol</th>
            <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Scheme Name</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Latest NAV</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>NAV Date</th>
            <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Category</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map((etf, idx) => (
            <tr key={etf.symbol || idx}>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.symbol}</td>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.schemeName}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.latestNav ?? '-'}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.navDate ?? '-'}</td>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.category ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ETFStatsPage; 