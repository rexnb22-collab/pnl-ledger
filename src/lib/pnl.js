/**
 * Pure P&L aggregation helpers. Amounts are signed: + profit/income, − loss/expense.
 * Day aggregates are keyed by ISO date (YYYY-MM-DD) so string comparison == date comparison.
 */

const emptyDay = (iso) => ({ iso, net: 0, trades: 0, wins: 0, losses: 0, revenue: 0, expenses: 0, items: [] });

export function aggregateByDay(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    let day = map.get(tx.date);
    if (!day) {
      day = emptyDay(tx.date);
      map.set(tx.date, day);
    }
    day.net += tx.amount;
    day.trades += 1;
    day.items.push(tx);
    if (tx.amount > 0) {
      day.wins += 1;
      day.revenue += tx.amount;
    } else if (tx.amount < 0) {
      day.losses += 1;
      day.expenses += -tx.amount;
    }
  }
  for (const day of map.values()) {
    day.net = Math.round(day.net * 100) / 100;
    day.items.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  }
  return map;
}

/** Day aggregates within an inclusive ISO range (null bounds = unbounded), sorted ascending. */
export function daysInRange(dailyMap, start, end) {
  const out = [];
  for (const day of dailyMap.values()) {
    if ((start === null || day.iso >= start) && (end === null || day.iso <= end)) out.push(day);
  }
  return out.sort((a, b) => (a.iso < b.iso ? -1 : 1));
}

export function summarize(days) {
  const s = {
    net: 0, revenue: 0, expenses: 0, trades: 0, wins: 0, losses: 0,
    tradingDays: 0, greenDays: 0, redDays: 0, bestDay: null, worstDay: null,
  };
  for (const d of days) {
    if (!d.trades) continue;
    s.net += d.net;
    s.revenue += d.revenue;
    s.expenses += d.expenses;
    s.trades += d.trades;
    s.wins += d.wins;
    s.losses += d.losses;
    s.tradingDays += 1;
    if (d.net > 0) s.greenDays += 1;
    if (d.net < 0) s.redDays += 1;
    if (!s.bestDay || d.net > s.bestDay.net) s.bestDay = d;
    if (!s.worstDay || d.net < s.worstDay.net) s.worstDay = d;
  }
  s.net = Math.round(s.net * 100) / 100;
  s.winRate = s.trades ? (s.wins / s.trades) * 100 : 0;
  s.avgDaily = s.tradingDays ? s.net / s.tradingDays : 0;
  s.profitFactor = s.expenses ? s.revenue / s.expenses : 0;
  return s;
}

/** Percent change vs a previous value; null when there is no meaningful baseline. */
export const percentChange = (current, previous) =>
  previous ? ((current - previous) / Math.abs(previous)) * 100 : null;

/** Running equity curve, downsampled to at most `maxPoints` points. */
export function cumulativeSeries(days, maxPoints = 120) {
  let running = 0;
  const series = days.map((d) => ({ iso: d.iso, v: (running += d.net) }));
  if (series.length <= maxPoints) return series;
  const step = series.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) => series[Math.min(series.length - 1, Math.round((i + 1) * step) - 1)]);
}

/** Largest |net| among days — used to scale colour intensity. */
export const maxAbsNet = (days) => days.reduce((m, d) => Math.max(m, Math.abs(d.net)), 0);

/** 0 (faint) … 3 (extreme) intensity tier for heat-map styling. */
export function intensityTier(net, maxAbs) {
  if (!net || !maxAbs) return 0;
  const r = Math.abs(net) / maxAbs;
  if (r >= 0.75) return 3;
  if (r >= 0.4) return 2;
  return 1;
}
