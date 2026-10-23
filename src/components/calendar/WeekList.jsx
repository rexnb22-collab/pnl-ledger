import clsx from 'clsx';
import { addDays, MONTH_SHORT, startOfWeek, todayISO, toISODate, WEEKDAY_LABELS } from '../../lib/date';
import { maxAbsNet } from '../../lib/pnl';
import { formatPercent, formatPnL } from '../../lib/format';

export default function WeekList({ focus, dailyMap, selectedDate, onSelect }) {
  const start = startOfWeek(focus);
  const today = todayISO();
  const rows = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const iso = toISODate(date);
    return { iso, date, label: WEEKDAY_LABELS[i], day: dailyMap.get(iso) };
  });
  const maxAbs = maxAbsNet(rows.filter((r) => r.day).map((r) => r.day));

  return (
    <div className="flex flex-1 flex-col gap-2">
      {rows.map(({ iso, date, label, day }) => {
        const active = day && day.trades > 0;
        const positive = active && day.net >= 0;
        const width = active && maxAbs ? Math.max(4, (Math.abs(day.net) / maxAbs) * 100) : 0;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={clsx(
              'group grid grid-cols-[72px_minmax(0,1fr)_120px] items-center gap-4 rounded-lg border px-4 py-3 text-left transition-all duration-150 hover:-translate-y-px md:grid-cols-[72px_minmax(0,1fr)_220px_120px]',
              active ? (positive ? 'border-profit/20 bg-profit-deep/15 hover:border-profit/40' : 'border-loss/20 bg-loss-deep/15 hover:border-loss/40') : 'border-line-subtle bg-surface-neutral/50 hover:border-line-strong',
              iso === selectedDate && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
            )}
          >
            <div>
              <p className="text-2xs font-semibold tracking-[0.12em] text-fg-subtle">{label}</p>
              <p className={clsx('text-lg font-bold tabular', iso === today ? 'text-accent' : 'text-fg')}>
                {date.getDate()} <span className="text-xs font-medium text-fg-subtle">{MONTH_SHORT[date.getMonth()]}</span>
              </p>
            </div>

            <div className="min-w-0">
              {active ? (
                <>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-900">
                    <div className={clsx('h-full animate-progress-fill rounded-full', positive ? 'bg-profit shadow-glow-profit' : 'bg-loss shadow-glow-loss')} style={{ width: `${width}%` }} />
                  </div>
                  <p className="mt-2 truncate text-xs text-fg-muted">{day.items.slice(0, 3).map((t) => t.title).join(' · ')}</p>
                </>
              ) : (
                <p className="text-xs text-fg-subtle">{iso > today ? 'Upcoming' : 'No Trades'}</p>
              )}
            </div>

            <div className="hidden text-xs text-fg-muted md:block">
              {active && (
                <span className="tabular">
                  <span className="font-semibold text-fg">{day.trades}</span> {day.trades === 1 ? 'trade' : 'trades'} · {formatPercent((day.wins / day.trades) * 100, 0)} win
                </span>
              )}
            </div>

            <p className={clsx('text-right text-base font-bold tabular', !active ? 'text-fg-subtle' : positive ? 'text-profit' : 'text-loss')}>
              {active ? formatPnL(day.net) : '—'}
            </p>
          </button>
        );
      })}
    </div>
  );
}
