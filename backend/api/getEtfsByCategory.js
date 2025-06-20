const { getEtfsByCategory } = require('../services/navDataService');

module.exports = async function (req, res) {
  const categoryKey = req.params.categoryKey;
  if (!categoryKey) {
    return res.status(400).json({ error: 'Missing categoryKey parameter' });
  }
  try {
    const category = await getEtfsByCategory(categoryKey);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ETFs for category', message: err.message });
  }
}; 