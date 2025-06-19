const yahooFinance = require('yahoo-finance2').default;

const etfSymbols = [
  'NIFTYBEES', 'ICICINIFTY', 'HDFCNIFTY', 'UTINIFTY', 'SBINIFTY',
  'JUNIORBEES', 'ICICIMID150', 'MOTILALM100', 'KOTAKMID50', 'NIPPMID150',
  'NIPPSMLCAP', 'ICICISMLCAP', 'SBIETFSC', 'MOTISMLCAP', 'HDFCSMLCAP',
  'HDFCHYBRID', 'ICICIHYBRID', 'SBIHYBRID', 'UTIHYBRID', 'MOTIHYBRID',
  'LIQUIDBEES', 'ICICILIQUID', 'SBILIQUID', 'HDFCLIQUID', 'UTILIQUIB',
  'MOTILALNAS100', 'MOTILALSP500', 'ICICINASDAQ', 'SBIINTERNAT', 'HDFCNASDAQ'
];

const heuristics = [
  s => s, // original
  s => s.replace('ID', ''),
  s => s.replace('ETF', ''),
  s => s.replace('FUND', ''),
  s => s.replace('CAP', ''),
  s => s.replace('BEES', ''),
  s => s.slice(0, 8),
  s => s.slice(0, 10),
];

async function findYahooAlias(symbol) {
  for (const h of heuristics) {
    const candidate = h(symbol);
    const yfSymbol = candidate + '.NS';
    try {
      const quote = await yahooFinance.quote(yfSymbol);
      if (quote && quote.shortName) {
        return candidate;
      }
    } catch (e) {
      // Not found, try next
    }
  }
  return null;
}

(async () => {
  const aliasMap = {};
  for (const symbol of etfSymbols) {
    const alias = await findYahooAlias(symbol);
    if (alias && alias !== symbol) {
      aliasMap[symbol] = alias;
      console.log(`Alias found: ${symbol} -> ${alias}`);
    }
  }
  console.log('\nFinal alias map:');
  console.log(JSON.stringify(aliasMap, null, 2));
})();

module.exports = {
  NIFTYBEES: ["NIFTYBEES.NS"],
  HDFCNIFTY: ["HDFCNIFETF.NS"],
  ICICINIFTY: ["ICICINF100.NS"],
  SBINIFTY: ["SETFNIF50.NS"],
  UTINIFTY: ["UTINIFTETF.NS"],
  JUNIORBEES: ["JUNIORBEES.NS"],
  ICICIMID150: ["ICICIM150.NS"],
  MOTILALM100: ["MOTILALM100.NS"],
  KOTAKMID50: ["KOTAKMID50.NS"],
  NIPPMID150: ["NIPPMID150.NS"],
  NIPPSMLCAP: ["NIPPSMLCAP.NS"],
  ICICISMLCAP: ["ICICISMLCAP.NS"],
  SBIETFSC: ["SBIETFSC.NS"],
  MOTISMLCAP: ["MOTISMLCAP.NS"],
  HDFCSMLCAP: ["HDFCSMLCAP.NS"],
  HDFCHYBRID: ["HDFCHYBRID.NS"],
  ICICIHYBRID: ["ICICIHYBRID.NS"],
  SBIHYBRID: ["SBIHYBRID.NS"],
  UTIHYBRID: ["UTIHYBRID.NS"],
  MOTIHYBRID: ["MOTIHYBRID.NS"],
  LIQUIDBEES: ["LIQUIDBEES.NS"],
  ICICILIQUID: ["ICICILIQUID.NS"],
  SBILIQUID: ["SBILIQUID.NS"],
  HDFCLIQUID: ["HDFCLIQUID.NS"],
  UTILIQUIB: ["UTILIQUIB.NS"],
  MOTILALNAS100: ["MOTILALNAS100.NS"],
  MOTILALSP500: ["MOTILALSP500.NS"],
  ICICINASDAQ: ["ICICINASDAQ.NS"],
  SBIINTERNAT: ["SBIINTERNAT.NS"],
  HDFCNASDAQ: ["HDFCNASDAQ.NS"]
}; 