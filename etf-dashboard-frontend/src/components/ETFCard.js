import React from 'react';

function isValid(val) {
  return val !== undefined && val !== null && val !== '-' && val !== 'N/A';
}

export default function ETFCard({ etf }) {
  return (
    <div className="etf-card" data-category={etf.category}>
      <div className="etf-name-container">
        <h2 className="etf-name">{etf.schemeName || etf.symbol}</h2>
        <div className="etf-symbol">{etf.symbol}</div>
      </div>
      <div className="price-section">
        <div className="current-price">
          {isValid(etf.latestNav) ? `₹${etf.latestNav}` : <span className="text-muted">N/A</span>}
        </div>
        <div className="nav-date">
          {isValid(etf.navDate) ? `As of ${etf.navDate}` : <span className="text-muted">-</span>}
        </div>
      </div>
    </div>
  );
}
