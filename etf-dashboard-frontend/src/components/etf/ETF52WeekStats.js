import React from 'react';
import './ETF52WeekStats.css';

const ETF52WeekStats = () => {
  // Hardcoded values for demonstration
  const weekHigh = 150.25;
  const weekLow = 95.75;
  const fallFromHigh = '12.5%';

  return (
    <div className="etf52weekstats-card">
      <h3>52 Week Stats</h3>
      <div className="etf52weekstats-row">
        <span>52 Week High:</span>
        <span>{weekHigh}</span>
      </div>
      <div className="etf52weekstats-row">
        <span>52 Week Low:</span>
        <span>{weekLow}</span>
      </div>
      <div className="etf52weekstats-row">
        <span>Fall from High:</span>
        <span>{fallFromHigh}</span>
      </div>
    </div>
  );
};

export default ETF52WeekStats; 