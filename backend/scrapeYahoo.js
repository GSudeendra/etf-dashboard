const axios = require('axios');
const cheerio = require('cheerio');

// 1. Scrape live price from Yahoo quote page
async function scrapeYahooQuote(symbol) {
  const url = `https://finance.yahoo.com/quote/${symbol}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const script = $('script').filter((i, el) => $(el).html().includes('root.App.main')).first().html();
  const jsonText = script.match(/root.App.main\s*=\s*(.*?);\n/)[1];
  const json = JSON.parse(jsonText);
  const quote = json.context.dispatcher.stores.QuoteSummaryStore.price;
  return {
    symbol: quote.symbol,
    price: quote.regularMarketPrice.raw,
    currency: quote.currency,
    change: quote.regularMarketChange.raw,
    percent: quote.regularMarketChangePercent.raw,
  };
}

// 2. Scrape news headlines for a symbol
async function scrapeYahooNews(symbol) {
  const url = `https://finance.yahoo.com/quote/${symbol}/news`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const news = [];
  $('.js-stream-content').each((i, el) => {
    const headline = $(el).find('h3').text();
    const link = $(el).find('a').attr('href');
    if (headline && link) {
      news.push({ headline, link: `https://finance.yahoo.com${link}` });
    }
  });
  return news;
}

// 3. Fetch historical data from Yahoo's JSON endpoint
async function getYahooHistorical(symbol, range = '1y', interval = '1d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
  const { data } = await axios.get(url);
  return data.chart.result[0];
}

// Example usage:
(async () => {
  const symbol = process.argv[2] || 'NIFTYBEES.NS';
  console.log('--- Live Price ---');
  try {
    const quote = await scrapeYahooQuote(symbol);
    console.log(quote);
  } catch (e) {
    console.error('Failed to fetch live price:', e.message);
  }

  console.log('\n--- News Headlines ---');
  try {
    const news = await scrapeYahooNews(symbol);
    news.slice(0, 5).forEach((item, i) => console.log(`${i + 1}. ${item.headline} (${item.link})`));
  } catch (e) {
    console.error('Failed to fetch news:', e.message);
  }

  console.log('\n--- Historical Data (last year, daily) ---');
  try {
    const hist = await getYahooHistorical(symbol);
    console.log('First 3 closes:', hist.indicators.quote[0].close.slice(0, 3));
  } catch (e) {
    console.error('Failed to fetch historical data:', e.message);
  }
})(); 