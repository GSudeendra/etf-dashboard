import React from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';

const ETFStatsPage = () => {
  const location = useLocation();
  const etfs = location.state?.etfs && location.state.etfs.length > 0 ? location.state.etfs : [];

  return (
    <div className="etf-stats-container">
      <div className="etf-stats-heading-wrapper">
        <h2 className="etf-stats-heading">ETF Stats</h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="etf-stats-table">
          <thead>
            <tr>
              <th className="etf-stats-th" style={{ minWidth: 120 }}>ETF Symbol</th>
              <th className="etf-stats-th" style={{ minWidth: 240 }}>Scheme Name</th>
              <th className="etf-stats-th" style={{ minWidth: 120 }}>Latest NAV</th>
              <th className="etf-stats-th" style={{ minWidth: 180 }}>NAV Date</th>
              <th className="etf-stats-th" style={{ minWidth: 180 }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {etfs.map((etf, idx) => (
              <tr
                key={etf.amfiCode || etf.symbol || idx}
                className="etf-stats-row"
                style={{ background: idx % 2 === 0 ? 'rgba(255, 243, 230, 0.18)' : 'rgba(255,255,255,0.98)' }}
              >
                <td className="etf-stats-td etf-stats-symbol">{etf.symbol}</td>
                <td className="etf-stats-td">{etf.schemeName}</td>
                <td className="etf-stats-td" style={{ textAlign: 'right' }}>{etf.latestNav ?? '-'}</td>
                <td className="etf-stats-td" style={{ textAlign: 'center' }}>{etf.navDate ?? '-'}</td>
                <td className="etf-stats-td" style={{ textAlign: 'center' }}>{etf.category ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ETFStatsPage; 