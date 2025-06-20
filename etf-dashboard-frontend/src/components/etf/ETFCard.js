import React from 'react';

function isValid(val) {
  return val !== undefined && val !== null && val !== '-' && val !== 'N/A';
}

export default function ETFCard({ etf, live }) {
  // Helper for live percent sign
  const getLivePercent = () => {
    if (!isValid(etf.per)) return '';
    const num = Number(etf.per);
    if (num > 0) return `(+${etf.per}%)`;
    if (num < 0) return `(${etf.per}%)`;
    return `(${etf.per}%)`;
  };

  // Helper for live price display
  const getLivePriceDisplay = () => {
    if (!isValid(etf.ltP)) return <span className="text-muted">N/A</span>;
    const color = Number(etf.per) > 0 ? '#28a745' : Number(etf.per) < 0 ? '#dc3545' : undefined;
    return (
      <span style={{ color, fontWeight: 600 }}>
        ₹{etf.ltP} {isValid(etf.per) ? getLivePercent() : ''}
      </span>
    );
  };

  return (
    <div className="etf-card" data-category={live ? etf.assets : etf.category} style={{ position: 'relative' }}>
      {live && (
        <span className="live-dot" title="Live"></span>
      )}
      <div className="etf-name-container">
        <h2 className="etf-name">{live ? etf.symbol : etf.schemeName || etf.symbol}</h2>
        <div className="etf-symbol">{live ? etf.assets : etf.symbol}</div>
      </div>
      <div className="price-section">
        <div className="current-price">
          {live
            ? getLivePriceDisplay()
            : (isValid(etf.latestNav) ? `₹${etf.latestNav}` : <span className="text-muted">N/A</span>)}
        </div>
        <div className="nav-date">
          {live
            ? (<><span>52W High: {isValid(etf.wkhi) ? `₹${etf.wkhi}` : '-'}</span><br /><span>52W Low: {isValid(etf.wklo) ? `₹${etf.wklo}` : '-'}</span></>)
            : (isValid(etf.navDate) ? `As of ${etf.navDate}` : <span className="text-muted">-</span>)}
        </div>
      </div>
    </div>
  );
}
