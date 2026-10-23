import { useMemo } from 'react';
import clsx from 'clsx';
import { buildMonthGrid, MONTH_NAMES, toISODate } from '../../lib/date';
import { daysInRange, intensityTier, maxAbsNet, summarize } from '../../lib/pnl';
import { formatPercent, formatPnL } from '../../lib/format';

const HEAT = {
  profit: ['', 'bg-profit/30', 'bg-profit/60', 'bg-profit shadow-[0_0_6px_rgba(34,197,94,0.7)]'],
  loss: ['', 'bg-loss/30', 'bg-loss/60', 'bg-loss shadow-[0_0_6px_rgba(239,68,68,0.7)]'],
};

export default function YearOverview({ focus, dailyMap, onOpenMonth }) {
  const year = focus.getFullYear();
  const months = useMemo(() => {
    const yearDays = daysInRange(dailyMap, `${year}-01-01`, `${year}-12-31`);
    const maxAbs = maxAbsNet(yearDays);
    return MONTH_NAMES.map((name, m) => {
      const start = toISODate(new Date(year, m, 1));
      const end = toISODate(new Date(year, m + 1, 0));
      return { name, m, start, maxAbs, summary: summarize(daysInRange(dailyMap, start, end)), grid: buildMonthGrid(year, m) };
    });
  }, [dailyMap, year]);

  return (
    <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
      {months.map(({ name, start, maxAbs, summary, grid }) => {
        const has = summary.tradingDays > 0;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onOpenMonth(start)}
            className="card-interactive flex flex-col gap-3 p-3.5 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{name}</span>
              {has ? <span className={summary.net >= 0 ? 'badge-profit' : 'badge-loss'}>{formatPnL(summary.net, { compact: true })}</span> : <span className="badge-neutral">No Trades</span>}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((c) => {
                const day = c.inMonth ? dailyMap.get(c.iso) : null;
                const tone = day ? (day.net >= 0 ? 'profit' : 'loss') : null;
                return (
                  <span
                    key={c.iso}
                    title={day ? `${c.iso}: ${formatPnL(day.net)}` : undefined}
                    className={clsx('aspect-square rounded-[3px]', !c.inMonth ? 'opacity-0' : tone ? HEAT[tone][intensityTier(day.net, maxAbs)] : 'bg-surface-neutral')}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-2xs text-fg-subtle">
              <span><span className="font-semibold text-fg-muted tabular">{summary.tradingDays}</span> trading days</span>
              <span>{has ? `${formatPercent(summary.winRate, 0)} win` : '—'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
