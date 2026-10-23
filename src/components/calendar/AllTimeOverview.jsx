import { useMemo } from 'react';
import clsx from 'clsx';
import { MONTH_SHORT, toISODate } from '../../lib/date';
import { daysInRange, summarize } from '../../lib/pnl';
import { formatPercent, formatPnL } from '../../lib/format';

export default function AllTimeOverview({ dailyMap, onOpenYear }) {
  const years = useMemo(() => {
    const isoKeys = [...dailyMap.keys()].sort();
    if (!isoKeys.length) return [];
    const first = Number(isoKeys[0].slice(0, 4));
    const last = Number(isoKeys[isoKeys.length - 1].slice(0, 4));
    const out = [];
    for (let y = last; y >= first; y--) {
      const months = MONTH_SHORT.map((label, m) => ({
        label,
        net: summarize(daysInRange(dailyMap, toISODate(new Date(y, m, 1)), toISODate(new Date(y, m + 1, 0)))).net,
      }));
      out.push({ year: y, months, summary: summarize(daysInRange(dailyMap, `${y}-01-01`, `${y}-12-31`)) });
    }
    return out;
  }, [dailyMap]);

  const maxAbs = Math.max(1, ...years.flatMap((y) => y.months.map((m) => Math.abs(m.net))));

  if (!years.length) {
    return <div className="grid flex-1 place-items-center text-sm text-fg-subtle">No transactions yet</div>;
  }

  return (
    <div className="grid flex-1 content-start gap-3 lg:grid-cols-2">
      {years.map(({ year, months, summary }) => (
        <button key={year} type="button" onClick={() => onOpenYear(`${year}-01-01`)} className="card-interactive p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">{year}</p>
              <p className={clsx('mt-1 text-2xl font-bold tabular', summary.net >= 0 ? 'text-profit' : 'text-loss')}>{formatPnL(summary.net)}</p>
            </div>
            <div className="text-right text-2xs text-fg-subtle">
              <p><span className="font-semibold text-fg-muted tabular">{summary.trades.toLocaleString()}</span> trades</p>
              <p className="mt-0.5"><span className="font-semibold text-accent tabular">{formatPercent(summary.winRate)}</span> win rate</p>
            </div>
          </div>
          <div className="mt-4 flex h-28 items-center gap-1.5">
            {months.map((m) => {
              const h = (Math.abs(m.net) / maxAbs) * 50;
              return (
                <div key={m.label} title={`${m.label} ${year}: ${formatPnL(m.net)}`} className="relative flex h-full flex-1 flex-col">
                  <div className="flex flex-1 items-end">
                    {m.net > 0 && <div className="w-full animate-progress-fill rounded-t-sm bg-profit/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ height: `${h * 2}%` }} />}
                  </div>
                  <div className="h-px bg-line-strong" />
                  <div className="flex flex-1 items-start">
                    {m.net < 0 && <div className="w-full rounded-b-sm bg-loss/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" style={{ height: `${h * 2}%` }} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-1.5">
            {months.map((m) => (
              <span key={m.label} className="flex-1 text-center text-[9px] font-medium uppercase text-fg-subtle">{m.label[0]}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
