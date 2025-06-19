const axios = require('axios');

// Replace with your actual Apps Script URL
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

async function fetchFromGoogleSheets(symbol) {
  try {
    console.log(`[GOOGLE_FETCHER] Requesting Google Sheets for symbol: ${symbol}`);
    const response = await axios.get(GOOGLE_SHEETS_API_URL);
    const data = response.data;
    // The keys in data should be the ETF symbols as in your sheet
    if (data[symbol]) {
      console.log(`[GOOGLE_FETCHER] Found data for ${symbol}: ${data[symbol]}`);
      return {
        symbol,
        currentPrice: data[symbol],
        fallbackSource: 'google_sheets'
      };
    }
    console.log(`[GOOGLE_FETCHER] No data for ${symbol} in Google Sheets.`);
    return null;
  } catch (err) {
    console.error('Google Sheets fetch error:', err.message);
    return null;
  }
}

module.exports = { fetchFromGoogleSheets }; 