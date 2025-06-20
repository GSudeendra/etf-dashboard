import React, { useState, useRef, useEffect } from 'react';
import ETFCard from './ETFCard';

export default function ETFGrid({ etfs }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!etfs) return;
    setVisibleCount(5);
  }, [etfs]);

  useEffect(() => {
    if (!etfs) return;
    const handleScroll = () => {
      if (!gridRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setVisibleCount(v => Math.min(v + 5, etfs.length));
      }
    };
    const grid = gridRef.current;
    if (grid) grid.addEventListener('scroll', handleScroll);
    return () => { if (grid) grid.removeEventListener('scroll', handleScroll); };
  }, [etfs]);

  // Only show ETFs with valid NAV
  const filteredEtfs = (etfs || []).filter(etf => etf.latestNav !== undefined && etf.latestNav !== null && etf.latestNav !== '-');
  const visible = filteredEtfs.slice(0, visibleCount);

  return (
    <div>
      <div className="etf-count">{filteredEtfs.length} ETFs found</div>
      <div className="etf-grid" ref={gridRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
        {visible.length > 0 ? (
          visible.map(etf => (
            <ETFCard key={etf.symbol} etf={etf} />
          ))
        ) : (
          <div className="no-etfs-message">No ETFs found</div>
        )}
      </div>
    </div>
  );
}
