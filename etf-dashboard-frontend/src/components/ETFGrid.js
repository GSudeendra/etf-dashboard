import React, { useState, useRef, useEffect } from 'react';
import ETFCard from './ETFCard';

export default function ETFGrid({
  etfs,
  loadingMap,
  onFetchMA,
  recommendation,
  price,
  grouped,
  onRetry,
  category,
  showOnlyWithData = true,
  categoryTitle,
  categoryDescription,
  showOtherEtfs = true // New prop: control whether to show "Other" ETFs
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const gridRef = useRef(null);

  // Infinite scroll for flat (non-grouped) view
  useEffect(() => {
    if (!etfs) return;
    setVisibleCount(10); // Reset on etfs change, increased initial count for better UX
  }, [etfs]);

  useEffect(() => {
    if (!etfs) return;
    const handleScroll = () => {
      if (!gridRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) { // Increased threshold for earlier loading
        setVisibleCount(v => Math.min(v + 10, etfs.length)); // Load more items at once
      }
    };
    const grid = gridRef.current;
    if (grid) grid.addEventListener('scroll', handleScroll);
    return () => { if (grid) grid.removeEventListener('scroll', handleScroll); };
  }, [etfs]);

  // Sorting: ETFs with data first, then by liquidity
  const sortEtfs = (etfs) => {
    return [...etfs].sort((a, b) => {
      const aHasData = a.currentPrice !== 'N/A' && a.currentPrice !== '-' && a.currentPrice !== undefined;
      const bHasData = b.currentPrice !== 'N/A' && b.currentPrice !== '-' && b.currentPrice !== undefined;

      // First priority: Show ETFs with data
      if (aHasData && !bHasData) return -1;
      if (!aHasData && bHasData) return 1;

      // Second priority: Sort by liquidity if both have data
      if (aHasData && bHasData) {
        const aLiquidity = typeof a.liquidity === 'number' ? a.liquidity : 0;
        const bLiquidity = typeof b.liquidity === 'number' ? b.liquidity : 0;
        if (aLiquidity !== bLiquidity) return bLiquidity - aLiquidity; // Higher liquidity first
      }

      // Third priority: Alphabetical by symbol
      return a.symbol.localeCompare(b.symbol);
    });
  };

  // Filtering logic for recommendation and price
  const filterEtfs = (etfs) => etfs.filter(etf => {
    // Skip ETFs without price data if showOnlyWithData is true
    if (showOnlyWithData && (etf.currentPrice === 'N/A' || etf.currentPrice === '-' || etf.currentPrice === undefined)) {
      return false;
    }

    const recommendationMatch = recommendation === 'all' || etf.recommendation === recommendation;
    let priceMatch = true;

    // Only apply price filter to ETFs with numeric prices
    if (typeof etf.currentPrice === 'number') {
      if (price === 'under-100') priceMatch = etf.currentPrice < 100;
      else if (price === '100-500') priceMatch = etf.currentPrice >= 100 && etf.currentPrice <= 500;
      else if (price === 'above-500') priceMatch = etf.currentPrice > 500;
    }

    return recommendationMatch && priceMatch;
  });

  // Render a category header with description if provided
  const renderCategoryHeader = (title, description) => {
    if (!title) return null;

    return (
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        {description && <p className="category-description">{description}</p>}
      </div>
    );
  };

  // Handle structured category view (from JSON file)
  if (categoryTitle) {
    const filteredEtfs = filterEtfs(etfs || []);
    const sorted = sortEtfs(filteredEtfs);
    const visible = sorted.slice(0, visibleCount);

    return (
      <div className="etf-category-container">
        {renderCategoryHeader(categoryTitle, categoryDescription)}
        <div className="etf-count">{filteredEtfs.length} ETFs found</div>
        <div className="etf-grid" ref={gridRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
          {visible.length > 0 ? (
            visible.map(etf => (
              <ETFCard
                key={etf.symbol}
                etf={etf}
                loading={loadingMap && loadingMap[etf.symbol]}
                onFetchMA={onFetchMA}
                onRetry={onRetry}
              />
            ))
          ) : (
            <div className="no-etfs-message">No ETFs found matching your filters</div>
          )}
        </div>
      </div>
    );
  }

  // Group unmapped/new categories under 'Other' if grouped view is used
  if (grouped) {
    const categoriesToShow = category && category !== 'all' ? [category] : Object.keys(grouped);
    const mainCategories = new Set(categoriesToShow);
    const otherEtfs = [];

    // Only collect other ETFs if showOtherEtfs is true
    if (showOtherEtfs) {
      Object.entries(grouped).forEach(([cat, etfs]) => {
        if (!mainCategories.has(cat)) {
          otherEtfs.push(...etfs);
        }
      });
    }

    return (
      <div className="etf-grouped-grid">
        {categoriesToShow.map(categoryKey => {
          const etfs = grouped[categoryKey] || [];
          const filteredEtfs = filterEtfs(etfs);
          const sorted = sortEtfs(filteredEtfs);
          const visible = sorted.slice(0, visibleCount);

          if (visible.length === 0 && showOnlyWithData) return null;

          return (
            <div key={categoryKey} className="etf-category-group">
              <h2 className="category-heading">{categoryKey.replace(/-/g, ' ').toUpperCase()}</h2>
              <div className="etf-count">{filteredEtfs.length} ETFs</div>
              <div className="etf-grid">
                {visible.length > 0 ? (
                  visible.map(etf => (
                    <ETFCard
                      key={etf.symbol}
                      etf={etf}
                      loading={loadingMap && loadingMap[etf.symbol]}
                      onFetchMA={onFetchMA}
                      onRetry={onRetry}
                    />
                  ))
                ) : (
                  <div className="no-etfs-message">No ETFs found in this category matching your filters</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Only show Other ETFs section if showOtherEtfs is true and we have some other ETFs to show */}
        {showOtherEtfs && otherEtfs.length > 0 && (
          <div className="etf-category-group">
            <h2 className="category-heading">OTHER</h2>
            <div className="etf-count">{filterEtfs(otherEtfs).length} ETFs</div>
            <div className="etf-grid">
              {sortEtfs(filterEtfs(otherEtfs)).slice(0, visibleCount).map(etf => (
                <ETFCard
                  key={etf.symbol}
                  etf={etf}
                  loading={loadingMap && loadingMap[etf.symbol]}
                  onFetchMA={onFetchMA}
                  onRetry={onRetry}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard flat view (for specific category or others)
  const filteredEtfs = filterEtfs(etfs || []);
  const sorted = sortEtfs(filteredEtfs);
  const visible = sorted.slice(0, visibleCount);

  return (
    <div>
      <div className="etf-count">{filteredEtfs.length} ETFs found</div>
      <div className="etf-grid" ref={gridRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
        {visible.length > 0 ? (
          visible.map(etf => (
            <ETFCard
              key={etf.symbol}
              etf={etf}
              loading={loadingMap && loadingMap[etf.symbol]}
              onFetchMA={onFetchMA}
              onRetry={onRetry}
            />
          ))
        ) : (
          <div className="no-etfs-message">No ETFs found matching your filters</div>
        )}
      </div>
    </div>
  );
}
