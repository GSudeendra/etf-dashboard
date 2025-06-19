// Utility functions for formatting

export function formatPrice(value) {
  if (value === '-' || value === undefined || value === null) return '-';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatPercent(value) {
  if (value === '-' || value === undefined || value === null) return '-';
  const num = Number(value);
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
} 