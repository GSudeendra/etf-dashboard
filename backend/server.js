const express = require('express');
const cors = require('cors');
const path = require('path');
const { NseIndia } = require('stock-nse-india');
const nseIndia = new NseIndia();
const cron = require('node-cron');
const yahooFinance = require('yahoo-finance2').default;
const yahooAliases = require('./discoverYahooAliases');
const { fetchFromGoogleSheets } = require('./googleSheetsFetcher');
const { getAllETFSymbols, buildETFCategoryMap, setupCategoryRoutes } = require('./etfCategoriesAPI');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// Serve etf_dashboard.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'etf_dashboard.html'));
});

// Serve a blank favicon to silence 404s
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Use the ETF categories API module
const etfSymbols = getAllETFSymbols();
const etfCategoryMap = buildETFCategoryMap();

// Helper to get category for a symbol
function getEtfCategory(symbol) {
  return etfCategoryMap[symbol] || 'Other';
}

// Helper: Recommendation logic (placeholder)
function getRecommendation(etf) {
  // Example: Buy if priceChange > 0, else hold
  if (etf.priceInfo && etf.priceInfo.change > 0) return 'buy';
  return 'hold';
}

// --- Moving Average Calculation ---
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const recent = prices.slice(-period);
  const sum = recent.reduce((acc, val) => acc + val, 0);
  return +(sum / period).toFixed(2);
}

let etfCache = { data: [], lastFetched: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10 min

// Symbol alias map for Yahoo Finance
const symbolAliasMap = {
  "NIFTYBEES": "NIFTYBEES",
  "HDFCNIFTY": "HDFCNIFETF",
  "ICICINIFTY": "ICICINF100",
  "SBINIFTY": "SETFNIF50",
  "UTINIFTY": "UTINIFTETF",
  // ...add others as needed
};

// Add/extend your alias map for tricky symbols:
const extraAliases = {
  'ICICIMID150': ['ICICIM150.NS'],
  'SBINIFTY': ['SETFNIF50.NS'],
  'ICICINIFTY': ['ICICINF100.NS'],
  'UTINIFTY': ['UTINIFTETF.NS']
};

function getAllAliases(symbol) {
  // Merge your main alias map and the extra ones
  return (extraAliases[symbol] || yahooAliases[symbol] || [(symbol + '.NS')]);
}

async function fetchYahooETF(symbol) {
  const candidates = yahooAliases[symbol] || [(symbol + '.NS')];
  for (const yfSymbol of candidates) {
    try {
      console.log(`Trying Yahoo fallback for ${symbol} with ${yfSymbol}`);
      const quote = await yahooFinance.quote(yfSymbol);
      if (!quote || !quote.regularMarketPrice) {
        console.warn(`[NO PRICE] No current price data for ${yfSymbol}`);
        continue;
      }
      return {
        symbol,
        name: quote.shortName || symbol,
        currentPrice: quote.regularMarketPrice,
        priceChange: quote.regularMarketChange ?? 'N/A',
        priceChangePercent: quote.regularMarketChangePercent ?? 'N/A',
        priceChangeStr: quote.regularMarketChange !== undefined ? `${quote.regularMarketChange >= 0 ? '+' : ''}${quote.regularMarketChange} (${quote.regularMarketChangePercent >= 0 ? '+' : ''}${quote.regularMarketChangePercent}%) today` : 'N/A',
        expenseRatio: 'N/A',
        aum: 'N/A',
        liquidity: quote.regularMarketVolume ? Math.min(100, Math.round((quote.regularMarketVolume * (quote.regularMarketPrice || 0)) / 1e7)) : 0,
        avgVolume: quote.averageDailyVolume3Month ? (quote.averageDailyVolume3Month / 1e6).toFixed(2) : 'N/A',
        recommendation: 'hold',
        description: quote.shortName || symbol,
        longTerm: { '500d': '-', '200d': '-', '100d': '-', '21d': '-' },
        shortTerm: { '50d': '-', '20d': '-', '10d': '-', '5d': '-' },
        fallbackSource: 'yahoo'
      };
    } catch (err) {
      console.log(`Yahoo fallback failed for ${symbol} with ${yfSymbol}: ${err.message}`);
      continue;
    }
  }
  return null;
}

async function getMergedEtfData(symbol) {
  let etf = await nseIndia.getEquityDetails(symbol).catch(() => null);
  let yahoo = null;
  const yfSymbol = (symbolAliasMap[symbol] || symbol) + ".NS";

  // If any critical field is missing, fetch Yahoo
  if (!etf || !etf.info || !etf.priceInfo || !etf.priceInfo.lastPrice) {
    yahoo = await fetchYahooETF(symbol);
  }

  // Merge: Prefer NSE, fallback to Yahoo for missing fields
  return {
    symbol: etf?.info?.symbol || yahoo?.symbol || symbol,
    name: etf?.info?.companyName || yahoo?.name || symbol,
    currentPrice: etf?.priceInfo?.lastPrice ?? yahoo?.currentPrice ?? 'N/A',
    priceChange: etf?.priceInfo?.change ?? yahoo?.priceChange ?? 'N/A',
    priceChangePercent: etf?.priceInfo?.pChange ?? yahoo?.priceChangePercent ?? 'N/A',
    priceChangeStr: etf?.priceInfo?.changeStr ?? yahoo?.priceChangeStr ?? 'N/A',
    expenseRatio: etf?.metadata?.expenseRatio ?? yahoo?.expenseRatio ?? 'N/A',
    aum: etf?.metadata?.aum ?? yahoo?.aum ?? 'N/A',
    liquidity: etf?.priceInfo?.liquidity ?? yahoo?.liquidity ?? 0,
    avgVolume: etf?.priceInfo?.avgVolume ?? yahoo?.avgVolume ?? 'N/A',
    recommendation: getRecommendation(etf),
    description: etf?.info?.companyName ?? yahoo?.description ?? symbol,
    longTerm: {
      '500d': etf?.priceInfo?.longTerm500d ?? yahoo?.longTerm['500d'] ?? '-',
      '200d': etf?.priceInfo?.longTerm200d ?? yahoo?.longTerm['200d'] ?? '-',
      '100d': etf?.priceInfo?.longTerm100d ?? yahoo?.longTerm['100d'] ?? '-',
      '21d': etf?.priceInfo?.longTerm21d ?? yahoo?.longTerm['21d'] ?? '-',
    },
    shortTerm: {
      '50d': etf?.priceInfo?.shortTerm50d ?? yahoo?.shortTerm['50d'] ?? '-',
      '20d': etf?.priceInfo?.shortTerm20d ?? yahoo?.shortTerm['20d'] ?? '-',
      '10d': etf?.priceInfo?.shortTerm10d ?? yahoo?.shortTerm['10d'] ?? '-',
      '5d': etf?.priceInfo?.shortTerm5d ?? yahoo?.shortTerm['5d'] ?? '-',
    },
    fallbackSource: yahoo ? 'yahoo' : undefined,
  };
}

async function fetchEtfData(category) {
  let symbolsToFetch = etfSymbols;
  if (category && category !== 'all') {
    symbolsToFetch = etfSymbols.filter(sym => etfCategoryMap[sym] === category);
  }
  // Each ETF is fetched independently and asynchronously, with immediate fallback
  const details = await Promise.all(symbolsToFetch.map(async sym => {
    // Try NSE first
    let etf = await nseIndia.getEquityDetails(sym).catch(() => null);
    if (etf && etf.info && etf.priceInfo && etf.priceInfo.lastPrice) {
      return etf;
    }
    // Try Yahoo fallback
    const yahooEtf = await fetchYahooETF(sym);
    if (yahooEtf && yahooEtf.currentPrice !== 'N/A' && yahooEtf.currentPrice !== '-') {
      return yahooEtf;
    }
    // Try Google Sheets fallback
    console.log(`[GOOGLE] Trying Google Sheets fallback for ${sym}`);
    const googleEtf = await fetchFromGoogleSheets(sym);
    if (googleEtf && googleEtf.currentPrice !== 'N/A' && googleEtf.currentPrice !== '-') {
      console.log(`[RESPONSE] /api/etfs ${sym} (google sheets fallback):`, JSON.stringify(googleEtf));
      return {
        symbol: sym,
        name: sym,
        category: etfCategoryMap[sym] || 'other',
        currentPrice: googleEtf.currentPrice,
        priceChange: '-',
        priceChangePercent: '-',
        priceChangeStr: '- (-%)',
        expenseRatio: '-',
        aum: '-',
        liquidity: 0,
        avgVolume: '-',
        recommendation: 'hold',
        description: 'Fetched from Google Sheets',
        longTerm: {
          '500d': '-',
          '200d': '-',
          '100d': '-',
          '21d': '-',
        },
        shortTerm: {
          '50d': '-',
          '20d': '-',
          '10d': '-',
          '5d': '-',
        },
        fallbackSource: 'google_sheets'
      };
    }
    // If all fail, return a no-data object
    return {
      symbol: sym,
      name: sym,
      category: etfCategoryMap[sym] || 'other',
      currentPrice: '-',
      priceChange: '-',
      priceChangePercent: '-',
      priceChangeStr: '- (-%)',
      expenseRatio: '-',
      aum: '-',
      liquidity: 0,
      avgVolume: '-',
      recommendation: 'hold',
      description: 'No data available',
      longTerm: {
        '500d': '-',
        '200d': '-',
        '100d': '-',
        '21d': '-',
      },
      shortTerm: {
        '50d': '-',
        '20d': '-',
        '10d': '-',
        '5d': '-',
      },
      fallback: false
    };
  }));
  const turnovers = details.map(etf => {
    if (etf && etf.priceInfo) {
      const volume = etf.priceInfo.totalTradedVolume || 0;
      const price = etf.priceInfo.lastPrice || 0;
      return volume * price;
    }
    return 0;
  });
  const maxTurnover = Math.max(...turnovers, 1); // avoid division by zero
  const periods = [5, 10, 20, 21, 50, 100, 200, 500];
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 3); // 3 years back for enough data
  const maResults = await Promise.all(details.map(async (etf, idx) => {
    let prices = [];
    if (etf && etf.info && etf.priceInfo) {
      try {
        const hist = await nseIndia.getEquityHistoricalData(etf.info.symbol, { start, end: now });
        prices = hist.map(entry => parseFloat(entry.CH_CLOSING_PRICE)).filter(Boolean);
      } catch (e) {
        // If historical data fails, leave prices empty
      }
    }
    const ma = {};
    periods.forEach(period => {
      const val = calculateSMA(prices, period);
      ma[period] = val !== null ? val : '-';
    });
    return ma;
  }));
  const result = symbolsToFetch.map((symbol, idx) => {
    const etf = details[idx];
    const ma = maResults[idx];
    if (etf && etf.info && etf.priceInfo) {
      const priceChangeRaw = etf.priceInfo.change || 0;
      const priceChangePercentRaw = etf.priceInfo.pChange || 0;
      const priceChange = Number(priceChangeRaw.toFixed(2));
      const priceChangePercent = Number(priceChangePercentRaw.toFixed(2));
      const priceChangeStr = `${priceChange >= 0 ? '+' : ''}${priceChange} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%) today`;
      const volume = etf.priceInfo.totalTradedVolume || 0;
      const price = etf.priceInfo.lastPrice || 0;
      const turnover = volume * price;
      const liquidityScore = Math.round((turnover / maxTurnover) * 100);
      return {
        symbol: etf.info.symbol || symbol,
        name: etf.info.companyName || etf.info.symbol || symbol,
        category: etf.info && etf.info.symbol ? etfCategoryMap[etf.info.symbol] || 'other' : 'other',
        currentPrice: price || 'N/A',
        priceChange: priceChange || 'N/A',
        priceChangePercent: priceChangePercent || 'N/A',
        priceChangeStr: priceChangeStr || 'N/A',
        expenseRatio: etf.metadata && etf.metadata.expenseRatio ? etf.metadata.expenseRatio : 'N/A',
        aum: etf.metadata && etf.metadata.aum ? etf.metadata.aum : 'N/A',
        liquidity: liquidityScore,
        avgVolume: etf.priceInfo && etf.priceInfo.quantityTraded ? (etf.priceInfo.quantityTraded / 1000000).toFixed(2) : 'N/A',
        recommendation: getRecommendation(etf),
        description: etf.info.companyName || etf.info.symbol || symbol,
        longTerm: {
          '500d': ma[500],
          '200d': ma[200],
          '100d': ma[100],
          '21d': ma[21],
        },
        shortTerm: {
          '50d': ma[50],
          '20d': ma[20],
          '10d': ma[10],
          '5d': ma[5],
        },
        fallbackSource: etf.fallbackSource === 'yahoo' ? 'yahoo' : undefined
      };
    } else {
      // Placeholder for missing data
      return {
        symbol,
        name: symbol,
        category: etf.info && etf.info.symbol ? etfCategoryMap[etf.info.symbol] || 'other' : 'other',
        currentPrice: 'N/A',
        priceChange: 'N/A',
        priceChangePercent: 'N/A',
        priceChangeStr: 'N/A',
        expenseRatio: 'N/A',
        aum: 'N/A',
        liquidity: 0,
        avgVolume: 'N/A',
        recommendation: 'hold',
        description: 'No data available',
        longTerm: {
          '500d': '-',
          '200d': '-',
          '100d': '-',
          '21d': '-',
        },
        shortTerm: {
          '50d': '-',
          '20d': '-',
          '10d': '-',
          '5d': '-',
        },
        fallbackSource: etf.fallbackSource === 'yahoo' ? 'yahoo' : undefined
      };
    }
  });
  return result;
}

app.get('/api/etfs', async (req, res) => {
  const { category } = req.query;
  console.log(`[REQUEST] /api/etfs category=${category || 'all'}`);
  try {
    const now = Date.now();
    if (!category && now - etfCache.lastFetched < CACHE_TTL && etfCache.data.length) {
      console.log(`[RESPONSE] /api/etfs cache:`, JSON.stringify(etfCache.data));
      return res.json(etfCache.data);
    }
    const result = await fetchEtfData(category);
    if (!category) {
      etfCache = { data: result, lastFetched: Date.now() };
    }
    console.log(`[RESPONSE] /api/etfs ${category || 'all'}:`, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    console.error('Error in /api/etfs:', err);
    res.status(500).json({ error: 'Failed to fetch ETF data. ' + (err.message || '') });
  }
});

app.get('/api/etfs/top-liquid', async (req, res) => {
  console.log(`[REQUEST] /api/etfs/top-liquid`);
  try {
    const now = Date.now();
    if (now - etfCache.lastFetched < CACHE_TTL && etfCache.data.length) {
      const top = etfCache.data
        .filter(d => typeof d.liquidity === 'number')
        .sort((a, b) => b.liquidity - a.liquidity)
        .slice(0, 10);
      console.log(`[RESPONSE] /api/etfs/top-liquid:`, JSON.stringify(top));
      return res.json(top);
    }
    res.status(503).json({ error: 'Data not ready, try again shortly.' });
  } catch (err) {
    console.error('Error in /api/etfs/top-liquid:', err);
    res.status(500).json({ error: 'Failed to fetch top liquid ETFs.' });
  }
});

// --- On-demand moving averages for a single ETF ---
app.get('/api/etf-ma/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  console.log(`[REQUEST] /api/etf-ma/${symbol}`);
  const periods = [5, 10, 20, 21, 50, 51, 100, 200, 500];
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 3);

  try {
    let prices = [];
    // Try NSE historical first
    try {
      const hist = await nseIndia.getEquityHistoricalData(symbol, { start, end: now });
      prices = hist.map(entry => parseFloat(entry.CH_CLOSING_PRICE || entry.close)).filter(Boolean);
      if (prices.length) {
        console.log(`[NSE-HIST] Loaded ${prices.length} records for ${symbol}`);
      }
    } catch (e) {
      // Fallback to Yahoo Finance
      const candidates = getAllAliases(symbol);
      let yahooHist = null;
      for (const yfSymbol of candidates) {
        try {
          yahooHist = await yahooFinance.historical(yfSymbol, { period1: start, period2: now, interval: '1d' });
          if (!yahooHist?.length) {
            console.warn(`[YF-HIST] No historical data for ${yfSymbol}`);
            continue;
          }
          console.log(`[YF-HIST] Loaded ${yahooHist.length} records for ${yfSymbol}`);
          prices = yahooHist.map(entry => parseFloat(entry.close)).filter(Boolean);
          if (prices.length) break;
        } catch (yfErr) {
          console.error(`[YF-ERROR] Failed to fetch historical data for ${yfSymbol}:`, yfErr.message);
        }
      }
    }

    // Only compute MAs if enough data
    const minRequired = Math.max(...periods);
    if (!prices || prices.length < minRequired) {
      return res.status(404).json({
        symbol,
        error: `Not enough data for MA calculation (have ${prices.length}, need ${minRequired})`,
        longTerm: {},
        shortTerm: {},
        fallback: true
      });
    }

    const ma = {};
    periods.forEach(period => {
      const val = calculateSMA(prices, period);
      ma[period] = val !== null ? val : '-';
    });

    function checkGoldenCross(prices) {
      const sma50 = calculateSMA(prices, 50);
      const sma200 = calculateSMA(prices, 200);
      if (!sma50 || !sma200) return '-';
      return sma50 > sma200
        ? 'Golden Cross (Bullish Signal)'
        : 'Death Cross (Bearish Signal)';
    }

    const crossSignal = checkGoldenCross(prices);

    const responseObj = {
      longTerm: {
        '500d': ma[500],
        '200d': ma[200],
        '100d': ma[100],
        '51d': ma[51],
        '21d': ma[21],
      },
      shortTerm: {
        '50d': ma[50],
        '20d': ma[20],
        '10d': ma[10],
        '5d': ma[5],
      },
      crossSignal
    };
    console.log(`[RESPONSE] /api/etf-ma/${symbol}:`, JSON.stringify(responseObj));
    res.json(responseObj);

  } catch (err) {
    console.error('Error in /api/etf-ma/:symbol', err.message);
    res.status(500).json({ error: 'Failed to fetch moving averages. ' + err.message });
  }
});

// --- Single ETF fetch endpoint for async card loading ---
app.get('/api/etf', async (req, res) => {
  const symbol = req.query.symbol;
  console.log(`[REQUEST] /api/etf symbol=${symbol}`);
  if (!symbol) return res.status(400).json({ error: 'Missing symbol parameter' });
  const periods = [5, 10, 20, 21, 50, 100, 200, 500];
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 3);
  try {
    let etf = await nseIndia.getEquityDetails(symbol).catch(() => null);
    let prices = [];
    let fallback = false;
    let fallbackData = null;
    if (etf && etf.info && etf.priceInfo && etf.priceInfo.lastPrice) {
      try {
        const hist = await nseIndia.getEquityHistoricalData(symbol, { start, end: now });
        prices = hist.map(entry => parseFloat(entry.CH_CLOSING_PRICE)).filter(Boolean);
      } catch (e) {
        // If historical data fails, leave prices empty
      }
    } else {
      // Try Yahoo fallback for current price
      const yahooEtf = await fetchYahooETF(symbol);
      if (yahooEtf && yahooEtf.currentPrice !== 'N/A' && yahooEtf.currentPrice !== '-') {
        etf = yahooEtf;
      } else {
        // Try Google Sheets fallback
        console.log(`[GOOGLE] Trying Google Sheets fallback for ${symbol}`);
        const googleEtf = await fetchFromGoogleSheets(symbol);
        if (googleEtf && googleEtf.currentPrice !== 'N/A' && googleEtf.currentPrice !== '-') {
          console.log(`[RESPONSE] /api/etf ${symbol} (google sheets fallback):`, JSON.stringify(googleEtf));
          const responseObj = {
            symbol,
            name: symbol,
            category: etfCategoryMap[symbol] || 'other',
            currentPrice: googleEtf.currentPrice,
            priceChange: '-',
            priceChangePercent: '-',
            priceChangeStr: '- (-%)',
            expenseRatio: '-',
            aum: '-',
            liquidity: 0,
            avgVolume: '-',
            recommendation: 'hold',
            description: 'Fetched from Google Sheets',
            longTerm: {
              '500d': '-',
              '200d': '-',
              '100d': '-',
              '21d': '-',
            },
            shortTerm: {
              '50d': '-',
              '20d': '-',
              '10d': '-',
              '5d': '-',
            },
            fallbackSource: 'google_sheets'
          };
          return res.json(responseObj);
        }
        // Try to fetch last available historical data as fallback
        try {
          const hist = await nseIndia.getEquityHistoricalData(symbol, { start, end: now });
          if (hist && hist.length > 0) {
            fallback = true;
            fallbackData = hist[hist.length - 1]; // last available
            prices = hist.map(entry => parseFloat(entry.CH_CLOSING_PRICE)).filter(Boolean);
          }
        } catch (e) {
          // No fallback data
        }
      }
    }
    const ma = {};
    periods.forEach(period => {
      const val = calculateSMA(prices, period);
      ma[period] = val !== null ? val : '-';
    });
    let responseObj;
    if (etf && etf.info && etf.priceInfo) {
      const priceChangeRaw = etf.priceInfo.change || 0;
      const priceChangePercentRaw = etf.priceInfo.pChange || 0;
      const priceChange = Number(priceChangeRaw.toFixed(2));
      const priceChangePercent = Number(priceChangePercentRaw.toFixed(2));
      const priceChangeStr = `${priceChange >= 0 ? '+' : ''}${priceChange} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent}%) today`;
      responseObj = {
        symbol: etf.info.symbol || symbol,
        name: etf.info.companyName || etf.info.symbol || symbol,
        category: etfCategoryMap[etf.info.symbol] || 'other',
        currentPrice: etf.priceInfo.lastPrice || 0,
        priceChange,
        priceChangePercent,
        priceChangeStr,
        expenseRatio: etf.metadata && etf.metadata.expenseRatio ? etf.metadata.expenseRatio : 0.1,
        aum: etf.metadata && etf.metadata.aum ? etf.metadata.aum : 1000,
        liquidity: etf.priceInfo && etf.priceInfo.totalTradedValue ? Math.min(100, Math.round((etf.priceInfo.totalTradedValue / 10000000))) : 50,
        avgVolume: etf.priceInfo && etf.priceInfo.quantityTraded ? (etf.priceInfo.quantityTraded / 1000000).toFixed(2) : '0.00',
        recommendation: getRecommendation(etf),
        description: etf.info.companyName || etf.info.symbol || symbol,
        longTerm: {
          '500d': ma[500],
          '200d': ma[200],
          '100d': ma[100],
          '21d': ma[21],
        },
        shortTerm: {
          '50d': ma[50],
          '20d': ma[20],
          '10d': ma[10],
          '5d': ma[5],
        },
        fallback: false
      };
      console.log(`[RESPONSE] /api/etf ICICINIFTY:`, JSON.stringify(responseObj));
      return res.json(responseObj);
    }
    if (fallback && fallbackData) {
      responseObj = {
        symbol,
        name: symbol,
        category: etfCategoryMap[symbol] || 'other',
        currentPrice: parseFloat(fallbackData.CH_CLOSING_PRICE) || '-',
        priceChange: '-',
        priceChangePercent: '-',
        priceChangeStr: `Last available: ${fallbackData.CH_TIMESTAMP || fallbackData.TIMESTAMP || '-'}`,
        expenseRatio: '-',
        aum: '-',
        liquidity: 0,
        avgVolume: '-',
        recommendation: 'hold',
        description: 'No live data. Showing last available historical data.',
        longTerm: {
          '500d': ma[500],
          '200d': ma[200],
          '100d': ma[100],
          '21d': ma[21],
        },
        shortTerm: {
          '50d': ma[50],
          '20d': ma[20],
          '10d': ma[10],
          '5d': ma[5],
        },
        fallback: true
      };
      console.log(`[RESPONSE] /api/etf ICICINIFTY (fallback):`, JSON.stringify(responseObj));
      return res.json(responseObj);
    }
    responseObj = {
      symbol,
      name: symbol,
      category: etfCategoryMap[symbol] || 'other',
      currentPrice: '-',
      priceChange: '-',
      priceChangePercent: '-',
      priceChangeStr: '- (-%)',
      expenseRatio: '-',
      aum: '-',
      liquidity: 0,
      avgVolume: '-',
      recommendation: 'hold',
      description: 'No data available',
      longTerm: {
        '500d': '-',
        '200d': '-',
        '100d': '-',
        '21d': '-',
      },
      shortTerm: {
        '50d': '-',
        '20d': '-',
        '10d': '-',
        '5d': '-',
      },
      fallback: false
    };
    console.log(`[RESPONSE] /api/etf ICICINIFTY (no data):`, JSON.stringify(responseObj));
    return res.json(responseObj);
  } catch (err) {
    console.error('Error in /api/etf:', err);
    res.status(500).json({ error: 'Failed to fetch ETF data. ' + (err.message || '') });
  }
});

app.get('/api/etfs/last-updated', (req, res) => {
  res.json({ lastFetched: etfCache.lastFetched });
});

cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Refreshing ETF cache...');
    etfCache.data = await fetchEtfData();
    etfCache.lastFetched = Date.now();
  } catch (err) {
    console.error('Error refreshing ETF cache:', err);
  }
});

// API endpoint for other ETFs (from etfCategoryMap)
app.get('/api/etfs/others', async (req, res) => {
  try {
    // Get symbols that are not in the standard categories
    const standardCategories = ['Nifty 50', 'Bank', 'IT', 'Private Bank', 'PSU Bank', 'Midcap', 'Smallcap', 'Healthcare'];
    const otherSymbols = Object.keys(etfCategoryMap).filter(symbol =>
      !standardCategories.includes(etfCategoryMap[symbol])
    );

    // Limit to a reasonable number to avoid overloading
    const limitedSymbols = otherSymbols.slice(0, 30);

    // Fetch data for these symbols
    const otherETFs = await Promise.all(
      limitedSymbols.map(async (symbol) => {
        try {
          return await getMergedEtfData(symbol);
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          return {
            symbol,
            name: symbol,
            category: etfCategoryMap[symbol] || 'Other',
            currentPrice: 'N/A',
            error: true
          };
        }
      })
    );

    res.json(otherETFs);
  } catch (error) {
    console.error('Error fetching other ETFs:', error);
    res.status(500).send('Failed to fetch other ETFs');
  }
});

// --- New endpoint to fetch ETFs by category ---
const fallbackByCategory = {
  'large-cap': ['NIFTYBEES', 'ICICINIFTY', 'UTINIFTY', 'SBINIFTY', 'HDFCNIFTY'],
  'mid-cap': ['JUNIORBEES', 'ICICIMID150', 'MOTILALM100', 'KOTAKMID50', 'NIPPMID150'],
  'small-cap': ['NIPPSMLCAP', 'ICICISMLCAP', 'SBIETFSC', 'MOTISMLCAP', 'HDFCSMLCAP'],
  'hybrid': ['HDFCHYBRID', 'ICICIHYBRID', 'SBIHYBRID', 'UTIHYBRID', 'MOTIHYBRID'],
  'liquid': ['LIQUIDBEES', 'ICICILIQUID', 'SBILIQUID', 'HDFCLIQUID', 'UTILIQUIB'],
  'international': ['MOTILALNAS100', 'MOTILALSP500', 'ICICINASDAQ', 'SBIINTERNAT', 'HDFCNASDAQ']
};

app.get('/api/etfs-by-category', async (req, res) => {
  console.log(`[REQUEST] /api/etfs-by-category`);
  try {
    const grouped = {};
    for (const [category, symbols] of Object.entries(fallbackByCategory)) {
      // Each ETF is fetched independently and asynchronously, with immediate fallback
      const results = await Promise.all(symbols.map(async sym => {
        // Try NSE first
        let etf = await nseIndia.getEquityDetails(sym).catch(() => null);
        if (etf && etf.info && etf.priceInfo && etf.priceInfo.lastPrice) {
          return {
            symbol: etf.info.symbol || sym,
            name: etf.info.companyName || etf.info.symbol || sym,
            category,
            currentPrice: etf.priceInfo.lastPrice,
            priceChange: etf.priceInfo.change,
            priceChangePercent: etf.priceInfo.pChange,
            volume: etf.priceInfo.totalTradedVolume,
            expenseRatio: etf.metadata && etf.metadata.expenseRatio ? etf.metadata.expenseRatio : 'N/A',
            aum: etf.metadata && etf.metadata.aum ? etf.metadata.aum : 'N/A',
            liquidity: etf.priceInfo.totalTradedVolume && etf.priceInfo.lastPrice ? Math.min(100, Math.round((etf.priceInfo.totalTradedVolume * etf.priceInfo.lastPrice) / 1e7)) : 0,
            avgVolume: etf.priceInfo.quantityTraded ? (etf.priceInfo.quantityTraded / 1e6).toFixed(2) : 'N/A',
            recommendation: getRecommendation(etf),
            description: etf.info.companyName || etf.info.symbol || sym,
            fallbackSource: undefined
          };
        }
        // Try Yahoo fallback
        const yahooEtf = await fetchYahooETF(sym);
        if (yahooEtf && yahooEtf.currentPrice !== 'N/A') {
          return { ...yahooEtf, category, fallbackSource: 'yahoo' };
        }
        // Try Google Sheets fallback
        console.log(`[GOOGLE] Trying Google Sheets fallback for ${sym}`);
        const googleEtf = await fetchFromGoogleSheets(sym);
        if (googleEtf && googleEtf.currentPrice !== 'N/A' && googleEtf.currentPrice !== '-') {
          console.log(`[RESPONSE] /api/etfs-by-category ${sym} (google sheets fallback):`, JSON.stringify(googleEtf));
          return {
            symbol: sym,
            name: sym,
            category,
            currentPrice: googleEtf.currentPrice,
            priceChange: '-',
            priceChangePercent: '-',
            volume: '-',
            expenseRatio: '-',
            aum: '-',
            liquidity: 0,
            avgVolume: '-',
            recommendation: 'hold',
            description: 'Fetched from Google Sheets',
            fallbackSource: 'google_sheets'
          };
        }
        // If all fail, return null
        return null;
      }));
      // Filter out nulls and ensure at least 5 per category
      const valid = results.filter(e => e && e.currentPrice !== 'N/A');
      grouped[category] = valid.slice(0, 5);
    }
    console.log(`[RESPONSE] /api/etfs-by-category:`, JSON.stringify(grouped));
    res.json(grouped);
  } catch (err) {
    console.error('Error in /api/etfs-by-category:', err);
    res.status(500).json({ error: 'Failed to fetch ETFs by category.' });
  }
});

// Set up the category routes from the etfCategoriesAPI module
setupCategoryRoutes(app, getMergedEtfData);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

