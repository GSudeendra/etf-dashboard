const path = require('path');
const fs = require('fs');

// Load ETF data from JSON file
const etfDataPath = path.join(__dirname, 'data', 'etfData.json');
let etfData;

try {
  etfData = JSON.parse(fs.readFileSync(etfDataPath, 'utf8'));
} catch (error) {
  console.error('Error loading ETF data from file:', error);
  etfData = { categories: {} };
}

// Extract all ETF symbols from the organized data
const getAllETFSymbols = () => {
  return Object.values(etfData.categories).reduce((symbols, category) => {
    return symbols.concat(category.symbols);
  }, []);
};

// Build mapping of ETF symbol to category
const buildETFCategoryMap = () => {
  const map = {};
  Object.entries(etfData.categories).forEach(([categoryKey, categoryData]) => {
    categoryData.symbols.forEach(symbol => {
      map[symbol] = categoryData.label;
    });
  });
  return map;
};

// API handlers
const setupCategoryRoutes = (app, getMergedEtfData) => {
  // API endpoint for categories structure
  app.get('/api/etf-categories', (req, res) => {
    console.log(`[REQUEST] /api/etf-categories`);
    try {
      // Return the categories structure from the JSON file
      const categories = {};
      Object.entries(etfData.categories).forEach(([key, category]) => {
        categories[key] = {
          label: category.label,
          description: category.description,
          symbolCount: category.symbols.length
        };
      });

      console.log(`[RESPONSE] /api/etf-categories: ${Object.keys(categories).length} categories`);
      res.json(categories);
    } catch (err) {
      console.error('Error in /api/etf-categories:', err);
      res.status(500).json({ error: 'Failed to fetch ETF categories.' });
    }
  });

  // API endpoint for ETFs by categoryKey (from the JSON structure)
  app.get('/api/etf-category/:categoryKey', async (req, res) => {
    const categoryKey = req.params.categoryKey;
    console.log(`[REQUEST] /api/etf-category/${categoryKey}`);

    try {
      if (!etfData.categories[categoryKey]) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const symbols = etfData.categories[categoryKey].symbols;
      const etfs = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            return await getMergedEtfData(symbol);
          } catch (error) {
            console.error(`Failed to fetch data for ${symbol}:`, error);
            return {
              symbol,
              name: symbol,
              category: etfData.categories[categoryKey].label,
              currentPrice: 'N/A',
              error: true
            };
          }
        })
      );

      console.log(`[RESPONSE] /api/etf-category/${categoryKey}: ${etfs.length} ETFs`);
      res.json(etfs);
    } catch (error) {
      console.error(`Error fetching ETFs for category ${categoryKey}:`, error);
      res.status(500).send(`Failed to fetch ETFs for category ${categoryKey}`);
    }
  });

  // Return all category keys for frontend usage
  app.get('/api/etf-category-keys', (req, res) => {
    console.log(`[REQUEST] /api/etf-category-keys`);
    try {
      const categoryKeys = Object.keys(etfData.categories);
      console.log(`[RESPONSE] /api/etf-category-keys: ${categoryKeys.length} categories`);
      res.json(categoryKeys);
    } catch (err) {
      console.error('Error in /api/etf-category-keys:', err);
      res.status(500).json({ error: 'Failed to fetch ETF category keys.' });
    }
  });
};

module.exports = {
  etfData,
  getAllETFSymbols,
  buildETFCategoryMap,
  setupCategoryRoutes
};
