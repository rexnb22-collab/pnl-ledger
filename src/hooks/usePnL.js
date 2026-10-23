import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatPeriodLabel, getPeriodRange, getPreviousPeriodFocus, parseISODate } from '../lib/date';
import { aggregateByDay, cumulativeSeries, daysInRange, percentChange, summarize } from '../lib/pnl';

// Shared across components so the aggregation runs once per (transactions, account, trader) change.
let cache = { txs: null, account: null, trader: null, map: new Map() };

export function useDailyMap() {
  const transactions = useAppStore((s) => s.transactions);
  const account = useAppStore((s) => s.selectedAccountId);
  const trader = useAppStore((s) => s.selectedTraderId);
  if (cache.txs !== transactions || cache.account !== account || cache.trader !== trader) {
    let scoped = account === 'all' ? transactions : transactions.filter((t) => t.accountId === account);
    if (trader && trader !== 'all') {
      scoped = scoped.filter((t) => (t.traderId || 'trader_1') === trader);
    }
    cache = { txs: transactions, account, trader, map: aggregateByDay(scoped) };
  }
  return cache.map;
}

/** Summary for the active top-bar range anchored on the calendar focus date. */
export function usePeriodSummary() {
  const dailyMap = useDailyMap();
  const range = useAppStore((s) => s.viewRange);
  const focusIso = useAppStore((s) => s.focusDate);

  return useMemo(() => {
    const focus = parseISODate(focusIso);
    const { start, end } = getPeriodRange(range, focus);
    const days = daysInRange(dailyMap, start, end);
    const summary = summarize(days);

    const prevFocus = getPreviousPeriodFocus(range, focus);
    let change = null;
    if (prevFocus) {
      const prev = getPeriodRange(range, prevFocus);
      change = percentChange(summary.net, summarize(daysInRange(dailyMap, prev.start, prev.end)).net);
    }

    return { range, start, end, days, summary, change, series: cumulativeSeries(days), label: formatPeriodLabel(range, focus) };
  }, [dailyMap, range, focusIso]);
}

/** Month-to-date progress for the month containing the focus date. */
export function useMonthlyGoal() {
  const dailyMap = useDailyMap();
  const focusIso = useAppStore((s) => s.focusDate);
  const target = useAppStore((s) => s.monthlyGoal);

  return useMemo(() => {
    const focus = parseISODate(focusIso);
    const { start, end } = getPeriodRange('month', focus);
    const net = summarize(daysInRange(dailyMap, start, end)).net;
    return { net, target, pct: target ? Math.max(0, (net / target) * 100) : 0, label: formatPeriodLabel('month', focus), end };
  }, [dailyMap, focusIso, target]);
}
