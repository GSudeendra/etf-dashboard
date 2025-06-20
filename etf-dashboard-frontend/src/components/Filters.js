import React from 'react';
import { RECOMMENDATIONS, PRICE_FILTERS } from '../constants';

export default function Filters({
  category, recommendation, price,
  onCategoryChange, onRecommendationChange, onPriceChange,
  categoryOptions = []
}) {
  return (
    <div className="controls">
      <div className="filter-group">
        <label>Category Filter</label>
        <select value={category} onChange={e => onCategoryChange(e.target.value)}>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Recommendation</label>
        <select value={recommendation} onChange={e => onRecommendationChange(e.target.value)}>
          <option value="all">All</option>
          <option value="buy">Buy</option>
          <option value="hold">Hold</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Price Range</label>
        <select value={price} onChange={e => onPriceChange(e.target.value)}>
          <option value="all">All</option>
          <option value="lt100">Below ₹100</option>
          <option value="100to500">₹100 - ₹500</option>
          <option value="gt500">Above ₹500</option>
        </select>
      </div>
    </div>
  );
}
