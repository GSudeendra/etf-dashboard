// API handler for triggering NAV fetch and save
const { fetchAndSaveNavData } = require('../../services/navDataService');

module.exports = async function (req, res) {
  try {
    const result = await fetchAndSaveNavData();
    if (result.error) {
      return res.status(500).json(result);
    }
    res.json({ message: 'NAV data fetched and saved successfully', file: result.file });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch and save NAV data', message: err.message });
  }
}; 