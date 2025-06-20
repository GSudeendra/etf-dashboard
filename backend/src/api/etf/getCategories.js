const { getAllCategories } = require('../../services/navDataService');

module.exports = async function (req, res) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get categories', message: err.message });
  }
}; 