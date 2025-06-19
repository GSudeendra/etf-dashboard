// ETF symbol lists by category
export const ETF_SYMBOLS_BY_CATEGORY = {
  'large-cap': ['NIFTYBEES', 'ICICINIFTY', 'HDFCNIFTY', 'UTINIFTY', 'SBINIFTY'],
  'mid-cap': ['JUNIORBEES', 'ICICIMID150', 'MOTILALM100', 'KOTAKMID50', 'NIPPMID150'],
  'small-cap': ['NIPPSMLCAP', 'ICICISMLCAP', 'SBIETFSC', 'MOTISMLCAP', 'HDFCSMLCAP'],
  'hybrid': ['HDFCHYBRID', 'ICICIHYBRID', 'SBIHYBRID', 'UTIHYBRID', 'MOTIHYBRID'],
  'liquid': ['LIQUIDBEES', 'ICICILIQUID', 'SBILIQUID', 'HDFCLIQUID', 'UTILIQUIB'],
  'international': ['MOTILALNAS100', 'MOTILALSP500', 'ICICINASDAQ', 'SBIINTERNAT', 'HDFCNASDAQ'],
  'sector-etfs': ['NETFIT', 'ICICIBANKN', 'BANKBEES', 'PSUBNKBEES', 'CONSUMBEES']
};

export const CATEGORIES = [
  { value: 'large-cap', label: 'Large Cap' },
  { value: 'mid-cap', label: 'Mid Cap' },
  { value: 'small-cap', label: 'Small Cap' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'international', label: 'International' },
  { value: 'sector-etfs', label: 'Sector ETFs' }
];

export const RECOMMENDATIONS = [
  { value: 'all', label: 'All Recommendations' },
  { value: 'buy', label: 'Buy Only' },
  { value: 'hold', label: 'Hold Only' }
];

export const PRICE_FILTERS = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-100', label: 'Under ₹100' },
  { value: '100-500', label: '₹100 - ₹500' },
  { value: 'above-500', label: 'Above ₹500' }
];
