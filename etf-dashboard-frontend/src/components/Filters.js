import React from 'react';
import { RECOMMENDATIONS, PRICE_FILTERS } from '../constants';

export default function Filters({
  category, recommendation, price,
  onCategoryChange, onRecommendationChange, onPriceChange,
  categories = []
}) {
  return (
    <div className="controls">
      <div className="filter-group">
        <label>Category Filter</label>
        <select value={category} onChange={e => onCategoryChange(e.target.value)}>
          {categories.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Recommendation</label>
        <select value={recommendation} onChange={e => onRecommendationChange(e.target.value)}>
          {RECOMMENDATIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Price Range</label>
        <select value={price} onChange={e => onPriceChange(e.target.value)}>
          {PRICE_FILTERS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
