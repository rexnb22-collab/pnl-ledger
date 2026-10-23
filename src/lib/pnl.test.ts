import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateByDay, summarize, intensityTier, percentChange, cumulativeSeries } from './pnl.js';

test('aggregateByDay correctly groups and computes wins and losses', () => {
  const transactions = [
    { date: '2026-10-01', amount: 350, type: 'trade_profit' },
    { date: '2026-10-01', amount: -150, type: 'trade_loss' },
    { date: '2026-10-02', amount: 500, type: 'trade_profit' },
  ];

  const map = aggregateByDay(transactions);
  assert.equal(map.size, 2);

  const day1 = map.get('2026-10-01');
  assert.equal(day1.net, 200);
  assert.equal(day1.trades, 2);
  assert.equal(day1.wins, 1);
  assert.equal(day1.losses, 1);
  assert.equal(day1.revenue, 350);
  assert.equal(day1.expenses, 150);

  const day2 = map.get('2026-10-02');
  assert.equal(day2.net, 500);
  assert.equal(day2.wins, 1);
});

test('summarize computes accurate metrics', () => {
  const days = [
    { iso: '2026-10-01', net: 200, trades: 2, wins: 1, losses: 1, revenue: 350, expenses: 150 },
    { iso: '2026-10-02', net: -100, trades: 1, wins: 0, losses: 1, revenue: 0, expenses: 100 },
    { iso: '2026-10-03', net: 400, trades: 2, wins: 2, losses: 0, revenue: 400, expenses: 0 },
  ];

  const s = summarize(days);
  assert.equal(s.net, 500);
  assert.equal(s.trades, 5);
  assert.equal(s.wins, 3);
  assert.equal(s.losses, 2);
  assert.equal(s.tradingDays, 3);
  assert.equal(s.greenDays, 2);
  assert.equal(s.redDays, 1);
  assert.equal(s.winRate, 60);
  assert.equal(s.profitFactor, 750 / 250);
});

test('intensityTier scales correctly', () => {
  assert.equal(intensityTier(0, 1000), 0);
  assert.equal(intensityTier(200, 1000), 1);
  assert.equal(intensityTier(500, 1000), 2);
  assert.equal(intensityTier(900, 1000), 3);
});

test('cumulativeSeries produces ascending equity points', () => {
  const days = [
    { iso: '2026-10-01', net: 100 },
    { iso: '2026-10-02', net: -50 },
    { iso: '2026-10-03', net: 200 },
  ];
  const series = cumulativeSeries(days);
  assert.deepEqual(series, [
    { iso: '2026-10-01', v: 100 },
    { iso: '2026-10-02', v: 50 },
    { iso: '2026-10-03', v: 250 },
  ]);
});
