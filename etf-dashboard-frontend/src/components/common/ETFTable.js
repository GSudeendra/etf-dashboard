import React from 'react';
import PropTypes from 'prop-types';

const ETFTable = ({ etfs }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #eee' }}>ETF Symbol</th>
        <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Current Price</th>
        <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>52W High</th>
        <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>52W Low</th>
        <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Fall From High</th>
        <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Action</th>
      </tr>
    </thead>
    <tbody>
      {etfs.map((etf, idx) => (
        <tr key={etf.symbol || idx}>
          <td style={{ padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.symbol}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.currentPrice ?? '-'}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.high ?? '-'}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.low ?? '-'}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.fall ?? '-'}</td>
          <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.action ?? '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

ETFTable.propTypes = {
  etfs: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string,
      currentPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      high: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      low: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fall: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      action: PropTypes.string,
    })
  ).isRequired,
};

export default ETFTable; 