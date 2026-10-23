/**
 * Realistic seed data generator for PnL Ledger demonstration.
 */

export function generateSampleTrades() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const todayDate = now.getDate();

  const trades = [];

  const sampleSetups = [
    { title: 'NVDA Long Breakout', cat: 'Stocks', note: 'Clean breakout over daily resistance with heavy volume confirmation.', sign: 1, base: 450 },
    { title: 'BTC/USDT Scalp 5m', cat: 'Crypto', note: 'Bounce from 4h demand zone. Exited at local high.', sign: 1, base: 320 },
    { title: 'TSLA Mean Reversion', cat: 'Stocks', note: 'Failed retest of VWAP. Hit stop loss quickly.', sign: -1, base: 180 },
    { title: 'NQ Futures Opening Bell', cat: 'Futures', note: 'Trend continuation after London session high swept.', sign: 1, base: 620 },
    { title: 'EUR/USD Short', cat: 'Forex', note: 'Bearish divergence on 1h chart ahead of ECB rate decision.', sign: 1, base: 240 },
    { title: 'SPY Put Debit Spread', cat: 'Options', note: 'Hedging overnight exposure. Market rebounded.', sign: -1, base: 210 },
    { title: 'AAPL Tech Earnings Run', cat: 'Stocks', note: 'Pre-earnings momentum long. Scaled out at +2.5R.', sign: 1, base: 510 },
    { title: 'ETH Momentum Flip', cat: 'Crypto', note: 'Breakout above $3,500 resistance level.', sign: 1, base: 380 },
    { title: 'Gold (XAUUSD) Pullback', cat: 'Commodities', note: 'Missed target by $1 and got stopped out at breakeven - fee.', sign: -1, base: 95 },
    { title: 'AMD Swing Long', cat: 'Stocks', note: 'Semiconductor strength following server chip benchmark reports.', sign: 1, base: 430 },
    { title: 'Shopify Store Revenue', cat: 'Sales', note: 'Weekly e-commerce product payouts.', sign: 1, base: 850 },
    { title: 'TradingView & Server Subscription', cat: 'Software', note: 'Pro subscription & VPS fees.', sign: -1, base: 65 },
    { title: 'SOL Breakout Scalp', cat: 'Crypto', note: 'Ecosystem volume spike. Quick 15m scalp.', sign: 1, base: 290 },
    { title: 'QQQ 0DTE Momentum', cat: 'Options', note: 'Overtraded afternoon chop. Good lesson to stick to rules.', sign: -1, base: 310 },
  ];

  // Distribute across the past 30 days
  let setupIdx = 0;
  for (let dayOffset = 28; dayOffset >= 0; dayOffset--) {
    const d = new Date(year, month, todayDate - dayOffset);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    // Skip most weekend trades, but allow occasional crypto/sales
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.35) {
      continue;
    }

    const iso = d.toISOString().split('T')[0];
    const numTrades = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numTrades; i++) {
      const template = sampleSetups[setupIdx % sampleSetups.length];
      setupIdx++;

      // Some variation in amount
      const multiplier = 0.75 + Math.random() * 0.6;
      const rawAmount = Math.round(template.base * multiplier * 100) / 100;
      const amount = template.sign > 0 ? rawAmount : -rawAmount;
      const type = amount >= 0 
        ? (template.cat === 'Sales' ? 'income' : 'trade_profit')
        : (template.cat === 'Software' ? 'expense' : 'trade_loss');

      const traderId = i % 2 === 0 ? 'trader_1' : 'trader_2';
      const partnerNotes = amount > 300 
        ? (traderId === 'trader_1' ? 'Trader 2: 🔥 Great discipline on the exit!' : 'Trader 1: 👏 Solid risk-to-reward ratio!')
        : (amount < -150 ? (traderId === 'trader_1' ? 'Trader 2: Good stop loss adherence, saved drawdown.' : 'Trader 1: Followed plan, good cut.') : '');

      trades.push({
        id: `demo-${iso}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        title: template.title,
        amount,
        type,
        date: iso,
        category: template.cat,
        accountId: 'main',
        traderId,
        notes: template.note,
        partnerNotes,
        screenshot: null,
        createdAt: d.getTime() + i * 3600000,
      });
    }
  }

  return trades;
}
