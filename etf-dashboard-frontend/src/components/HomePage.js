import React from 'react';

const etfData = [
  { name: 'ETF Alpha', current: 120.00, high: 150.25, low: 95.75, fall: '20.1%', action: 'Neutral' },
  { name: 'ETF Beta', current: 180.00, high: 200.10, low: 120.50, fall: '10.0%', action: 'Buy' },
  { name: 'ETF Gamma', current: 130.00, high: 175.00, low: 110.00, fall: '25.7%', action: 'Sell' },
  { name: 'ETF Zeta', current: 160.00, high: 210.00, low: 140.00, fall: '23.8%', action: 'Hold' },
];

const HomePage = () => {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h2>ETF Stats</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid #eee' }}>ETF Name</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Current Price</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>52W High</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>52W Low</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Fall From High</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #eee' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {etfData.map((etf, idx) => (
            <tr key={idx}>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.name}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.current}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.high}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.low}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.fall}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f5f5f5' }}>{etf.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage; 