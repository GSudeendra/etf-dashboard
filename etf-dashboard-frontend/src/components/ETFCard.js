import React, { useState } from 'react';
import { formatPrice, formatPercent } from '../utils/format';

function SkeletonCard() {
  return (
    <div className="etf-card" style={{opacity:0.5}}>
      <div style={{height:220, display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span className="spinner" style={{display:'inline-block',width:32,height:32,border:'4px solid #eee',borderTop:'4px solid #FF6B35',borderRadius:'50%',animation:'spin 1s linear infinite'}}></span>
      </div>
    </div>
  );
}

function isValid(val) {
  return val !== undefined && val !== null && val !== '-' && val !== 'N/A';
}

// Helper function to safely format category
function formatCategory(category) {
  if (!isValid(category)) return 'N/A';
  return String(category).replace(/-/g, ' ').toUpperCase();
}

// Clean up ETF name to remove redundant information
function formatETFName(name, symbol) {
  if (!isValid(name)) return symbol || 'N/A';

  // Remove redundant symbol mentions at the end
  if (symbol && name.endsWith(symbol)) {
    name = name.substring(0, name.length - symbol.length).trim();
    // Remove trailing dash if exists
    if (name.endsWith('-') || name.endsWith('—')) {
      name = name.substring(0, name.length - 1).trim();
    }
  }

  return name;
}

export default function ETFCard({ etf, onFetchMA, loading, onRetry }) {
  const [ma, setMA] = useState(null);
  const [maLoading, setMALoading] = useState(false);
  const [maError, setMAError] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const handleShowMA = async () => {
    setMALoading(true);
    setMAError(null);
    try {
      const maData = await onFetchMA(etf.symbol);
      setMA(maData);
    } catch (e) {
      setMAError('Failed to load moving averages.');
    } finally {
      setMALoading(false);
    }
  };
  const handleRetry = async () => {
    if (!onRetry) return;
    setRetryLoading(true);
    await onRetry(etf.symbol);
    setRetryLoading(false);
  };
  if (loading) return <SkeletonCard />;
  const isUnavailable = !isValid(etf.currentPrice);
  const liquidityClass = etf.liquidity >= 80 ? 'high-liquidity' : etf.liquidity >= 60 ? 'medium-liquidity' : 'low-liquidity';
  const priceChangeClass = etf.priceChange >= 0 ? 'positive' : 'negative';

  // Calculate price highlight class
  const priceHighlightClass = etf.priceChange > 1 ? 'price-highlight-strong-positive' :
                             etf.priceChange > 0 ? 'price-highlight-positive' :
                             etf.priceChange < -1 ? 'price-highlight-strong-negative' :
                             etf.priceChange < 0 ? 'price-highlight-negative' : '';

  // Format ETF name
  const displayName = formatETFName(etf.name, etf.symbol);

  return (
    <div className={`etf-card${isUnavailable ? ' etf-unavailable' : ''}`} data-category={etf.category} data-recommendation={etf.recommendation} data-price={etf.currentPrice}>
      {isUnavailable ? (
        <div style={{textAlign:'center',padding:'40px 0',color:'#888'}}>
          <div style={{fontSize:'2.2rem',marginBottom:8}} title="NSE data not available">⚠️</div>
          <div style={{fontWeight:600,fontSize:'1.1rem'}}>Data temporarily unavailable</div>
          <div style={{marginTop:8,fontSize:'0.95rem'}}>This ETF's data could not be loaded.<br/>Try again later.</div>
          {onRetry && (
            <button className="retry-btn" style={{marginTop:16,padding:'8px 18px',borderRadius:8,border:'1px solid #ccc',background:'#f8f9fa',fontWeight:600,cursor:'pointer'}} onClick={handleRetry} disabled={retryLoading}>
              {retryLoading ? 'Retrying...' : 'Retry | Fetch Latest'}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Category Badge - Moved to top for better hierarchy */}
          <div className={`category-badge ${isValid(etf.category) ? etf.category : 'unknown'}`}>
            {formatCategory(etf.category)}
            {etf.fallbackSource &&
              <span className="data-source">{etf.fallbackSource === 'yahoo' ? ' (Yahoo)' :
                                           etf.fallbackSource === 'google_sheets' ? ' (G-Sheets)' : ''}</span>
            }
          </div>

          {/* ETF Name - Enlarged and more prominent */}
          <div className="etf-name-container">
            <h2 className="etf-name">
              {displayName}
            </h2>
            <div className="etf-symbol">{etf.symbol}</div>
          </div>

          {/* Price section with enhanced styling */}
          <div className={`price-section ${priceHighlightClass}`}>
            <div className="current-price">
              {isValid(etf.currentPrice) ? formatPrice(etf.currentPrice) : <span className="text-muted">N/A</span>}
            </div>
            <div className={`price-change ${priceChangeClass}`}>
              {isValid(etf.priceChange) ? formatPercent(etf.priceChange) : <span className="text-muted">N/A</span>}
              {isValid(etf.priceChangeStr) &&
                <div className="price-change-detail">{etf.priceChangeStr.replace(/today$/, '')}</div>
              }
            </div>
          </div>

          <div className={`recommendation ${etf.recommendation}`}>
            {isValid(etf.recommendation) ? etf.recommendation.toUpperCase() : <span className="text-muted">N/A</span>}
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value" style={!isValid(etf.expenseRatio) ? {color:'#bbb'} : {}}>{isValid(etf.expenseRatio) ? etf.expenseRatio + '%' : 'N/A'}</div>
              <div className="metric-label">Expense Ratio</div>
            </div>
            <div className="metric">
              <div className="metric-value" style={!isValid(etf.aum) ? {color:'#bbb'} : {}}>{isValid(etf.aum) ? formatPrice(etf.aum) + 'Cr' : 'N/A'}</div>
              <div className="metric-label">AUM</div>
            </div>
            <div className="metric">
              <div className="metric-value" style={!isValid(etf.avgVolume) ? {color:'#bbb'} : {}}>{isValid(etf.avgVolume) ? etf.avgVolume + 'Cr' : 'N/A'}</div>
              <div className="metric-label">Avg Volume</div>
            </div>
          </div>

          <div className="liquidity-indicator">
            <span><strong>Liquidity:</strong></span>
            <div className="liquidity-bar">
              <div className={`liquidity-fill ${liquidityClass}`} style={{width: `${etf.liquidity}%`}}></div>
            </div>
            <span><strong>{isValid(etf.liquidity) ? etf.liquidity + '%' : 'N/A'}</strong></span>
          </div>

          <div style={{textAlign:'center',marginTop:18}}>
            {!ma && (
              <button className="ma-expand-btn" style={{background:'#f8f9fa',border:'1px solid #ccc',padding:'8px 18px',borderRadius:8,cursor:'pointer',fontWeight:600}} onClick={handleShowMA} disabled={maLoading}>
                {maLoading ? 'Calculating...' : 'Show Moving Averages'}
              </button>
            )}
          </div>

          <div className="moving-averages" style={{display: ma ? 'block' : 'none',marginTop:18}}>
            {ma && (
              <>
                <div className="ma-section">
                  <div className="ma-title">📈 Long-Term Analysis (Investors)</div>
                  <div className="ma-grid">
                    <div className="ma-item bullish"><div className="ma-period">500 Days</div><div className="ma-price">{isValid(ma.longTerm['500d']) ? ma.longTerm['500d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">200 Days</div><div className="ma-price">{isValid(ma.longTerm['200d']) ? ma.longTerm['200d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">100 Days</div><div className="ma-price">{isValid(ma.longTerm['100d']) ? ma.longTerm['100d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">51 Days</div><div className="ma-price">{isValid(ma.longTerm['51d']) ? ma.longTerm['51d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">21 Days</div><div className="ma-price">{isValid(ma.longTerm['21d']) ? ma.longTerm['21d'] : '-'}</div><div className="ma-signal">-</div></div>
                  </div>
                </div>
                <div className="ma-section">
                  <div className="ma-title">⚡ Short-Term Analysis (Traders)</div>
                  <div className="ma-grid">
                    <div className="ma-item bullish"><div className="ma-period">50 Days</div><div className="ma-price">{isValid(ma.shortTerm['50d']) ? ma.shortTerm['50d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">20 Days</div><div className="ma-price">{isValid(ma.shortTerm['20d']) ? ma.shortTerm['20d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">10 Days</div><div className="ma-price">{isValid(ma.shortTerm['10d']) ? ma.shortTerm['10d'] : '-'}</div><div className="ma-signal">-</div></div>
                    <div className="ma-item bullish"><div className="ma-period">5 Days</div><div className="ma-price">{isValid(ma.shortTerm['5d']) ? ma.shortTerm['5d'] : '-'}</div><div className="ma-signal">-</div></div>
                  </div>
                </div>
                <div style={{textAlign:'center',marginTop:10,fontWeight:'bold',fontSize:'1.1em'}}>
                  {ma.crossSignal ? `📊 ${ma.crossSignal}` : ''}
                </div>
              </>
            )}
            {maError && <div style={{color:'red',textAlign:'center',padding:18}}>{maError}</div>}
          </div>
        </>
      )}
    </div>
  );
}
