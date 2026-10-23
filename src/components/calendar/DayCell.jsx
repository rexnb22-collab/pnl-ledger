import clsx from 'clsx';
import { TrendingDown, Trophy } from 'lucide-react';
import { formatLongDate } from '../../lib/date';
import { formatPercent, formatPnL } from '../../lib/format';

const TONE_STYLES = {
  profit: [
    '',
    'bg-profit/20 border-profit/35 hover:border-profit/50',
    'bg-profit/30 border-profit/45 hover:border-profit/60',
    'bg-profit/40 border-profit/55 shadow-glow-profit',
  ],
  loss: [
    '',
    'bg-loss/20 border-loss/35 hover:border-loss/50',
    'bg-loss/30 border-loss/45 hover:border-loss/60',
    'bg-loss/40 border-loss/55 shadow-glow-loss',
  ],
};

const GLOW_STYLES = {
  profit: '0 0 40px -8px rgba(0, 255, 163, 0.4)',
  loss: '0 0 40px -8px rgba(255, 45, 85, 0.4)',
};

function DayPopover({ day, col, row }) {
  const winRate = day.trades ? (day.wins / day.trades) * 100 : 0;
  const shown = day.items.slice(0, 4);
  return (
    <div
      role="tooltip"
      className={clsx(
        'pointer-events-none invisible absolute z-40 w-72 rounded-2xl border border-white/8 bg-black/70 p-4 text-left opacity-0 shadow-2xl backdrop-blur-3xl',
        'transition-all delay-0 duration-250 group-hover:visible group-hover:opacity-100 group-hover:delay-200 group-focus-visible:visible group-focus-visible:opacity-100',
        row === 0 ? 'top-full mt-2.5 translate-y-1 group-hover:translate-y-0' : 'bottom-full mb-2.5 -translate-y-1 group-hover:translate-y-0',
        col <= 1 ? 'left-0' : col >= 5 ? 'right-0' : 'left-1/2 -ml-36',
      )}
    >
      <p className="text-xs font-bold text-fg-subtle">{formatLongDate(day.iso)}</p>
      <p className={clsx('mt-1 text-xl font-black tabular', day.net >= 0 ? 'text-profit' : 'text-loss')}>{formatPnL(day.net)}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-black/40 backdrop-blur-2xl px-3 py-2 border border-white/6">
          <p className="text-fg-subtle">Revenue</p>
          <p className="font-bold text-profit tabular">{formatPnL(day.revenue, { compact: true })}</p>
        </div>
        <div className="rounded-xl bg-black/40 backdrop-blur-2xl px-3 py-2 border border-white/6">
          <p className="text-fg-subtle">Expenses</p>
          <p className="font-bold text-loss tabular">{formatPnL(-day.expenses, { compact: true })}</p>
        </div>
        <div className="rounded-xl bg-black/40 backdrop-blur-2xl px-3 py-2 border border-white/6">
          <p className="text-fg-subtle">Win rate</p>
          <p className="font-bold text-accent tabular">{formatPercent(winRate, 0)}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 border-t border-white/6 pt-3">
        {shown.map((tx) => (
          <li key={tx.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-fg-muted">{tx.title}</span>
            <span className={clsx('shrink-0 font-bold tabular', tx.amount >= 0 ? 'text-profit' : 'text-loss')}>{formatPnL(tx.amount)}</span>
          </li>
        ))}
        {day.items.length > shown.length && (
          <li className="text-xs text-fg-subtle">+{day.items.length - shown.length} more transactions</li>
        )}
      </ul>
      <p className="mt-3 text-[11px] text-fg-subtle">Click to view, edit or delete</p>
    </div>
  );
}

/** One month-grid cell: adjacent-month filler, no-trade day, or a profit/loss day with hover details. */
export default function DayCell({ cell, day, tier, col, row, isToday, isSelected, extreme, onSelect }) {
  if (!cell.inMonth) {
    return (
      <div className="flex min-h-[92px] flex-col rounded-xl border border-dashed border-white/6 bg-black/20 backdrop-blur-2xl p-2.5 opacity-40">
        <span className="text-xs font-bold text-fg-subtle tabular">{cell.day}</span>
      </div>
    );
  }

  const active = day && day.trades > 0;
  const tone = active ? (day.net >= 0 ? 'profit' : 'loss') : 'neutral';
  const glowStyle = active ? GLOW_STYLES[tone] : 'none';

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.iso)}
      aria-pressed={isSelected}
      aria-label={active ? `${cell.iso}: ${formatPnL(day.net)}, ${day.trades} ${day.trades === 1 ? 'trade' : 'trades'}` : `${cell.iso}: no trades`}
      className={clsx(
        'group relative flex min-h-[92px] flex-col rounded-xl border p-2.5 text-left transition-all duration-250 ease-out-expo hover:z-30 hover:-translate-y-1 hover:shadow-xl focus-visible:z-30 active:scale-[0.96]',
        active ? TONE_STYLES[tone][tier] : 'border-white/6 bg-black/25 backdrop-blur-2xl hover:border-white/10 hover:bg-black/30',
        isSelected && 'ring-2 ring-profit ring-offset-2 ring-offset-black',
      )}
      style={{ boxShadow: glowStyle !== 'none' ? glowStyle : undefined }}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'grid h-7 min-w-7 place-items-center rounded-lg px-1.5 text-xs font-bold tabular',
            isToday ? 'bg-profit text-ink-950 shadow-glow-profit' : active ? 'text-fg' : 'text-fg-muted',
          )}
        >
          {cell.day}
        </span>
      </div>

      <div className="mt-auto">
        {active ? (
          <>
            <div className="flex items-center justify-between">
              <p className={clsx('truncate text-sm sm:text-base font-black leading-tight tabular xl:text-[16px]', tone === 'profit' ? 'text-profit' : 'text-loss', tier === 3 && `text-glow-${tone}`)}>
                {formatPnL(day.net, { compact: true })}
              </p>
              {extreme === 'best' && <Trophy size={14} className="text-profit drop-shadow-[0_0_12px_rgba(0,255,163,1)]" aria-label="Best day" />}
              {extreme === 'worst' && <TrendingDown size={14} className="text-loss drop-shadow-[0_0_12px_rgba(255,45,85,1)]" aria-label="Worst day" />}
            </div>
            <p className="mt-1 text-[11px] sm:text-xs font-bold text-fg/80 truncate">
              <span className="hidden sm:inline">{day.trades} {day.trades === 1 ? 'Trade' : 'Trades'}</span>
              <span className="sm:hidden">{day.trades} tr</span>
            </p>
          </>
        ) : (
          <p className="text-[11px] sm:text-xs font-bold text-fg-subtle truncate">
            {cell.future ? '—' : (<><span className="hidden sm:inline">No Trades</span><span className="sm:hidden">—</span></>)}
          </p>
        )}
      </div>

      {active && <DayPopover day={day} col={col} row={row} />}
    </button>
  );
}
