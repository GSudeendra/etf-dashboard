const { ensureNavData } = require('../services/navDataService');

module.exports = async function (req, res) {
  try {
    const navData = await ensureNavData();
    res.json({ categories: navData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ETF data', message: err.message });
  }
}; 