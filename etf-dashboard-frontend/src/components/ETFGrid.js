import React, { useState, useEffect } from 'react';
import ETFCard from './ETFCard';

export default function ETFGrid({ etfs, categoryKey }) {
  // Only show ETFs with valid NAV
  const filteredEtfs = (etfs || []).filter(etf => etf.latestNav !== undefined && etf.latestNav !== null && etf.latestNav !== '-');
  const [visibleCount, setVisibleCount] = useState(5);

  // When categoryKey changes, reset visibleCount to 5
  useEffect(() => {
    setVisibleCount(5);
  }, [categoryKey]);

  // Infinite scroll: load more when user scrolls near bottom
  useEffect(() => {
    if (!filteredEtfs.length) return;
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) {
        setVisibleCount(v => Math.min(v + 5, filteredEtfs.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEtfs.length]);

  // Auto-load more if not scrollable
  useEffect(() => {
    if (!filteredEtfs.length) return;
    // If all visible, do nothing
    if (visibleCount >= filteredEtfs.length) return;
    // If not scrollable, load more
    if (window.innerHeight >= document.body.offsetHeight) {
      setTimeout(() => {
        setVisibleCount(v => Math.min(v + 5, filteredEtfs.length));
      }, 0);
    }
  }, [visibleCount, filteredEtfs.length]);

  const visible = filteredEtfs.slice(0, visibleCount);

  return (
    <div>
      <div className="etf-count">{filteredEtfs.length} ETFs found</div>
      <div className="etf-grid">
        {visible.length > 0 ? (
          visible.map((etf, idx) => (
            <ETFCard key={etf.amfiCode || etf.symbol || idx} etf={etf} />
          ))
        ) : (
          <div className="no-etfs-message">No ETFs found</div>
        )}
      </div>
    </div>
  );
}
