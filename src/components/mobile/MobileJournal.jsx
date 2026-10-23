import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Plus, Share2, TrendingDown, Trophy, X } from 'lucide-react';
import { useAppStore, VIEW_RANGES } from '../../store/useAppStore';
import { useDailyMap, usePeriodSummary } from '../../hooks/usePnL';
import {
  addDays,
  buildMonthGrid,
  daysInMonth,
  MONTH_SHORT,
  parseISODate,
  startOfWeek,
  toISODate,
  todayISO,
  weekdayIndex,
} from '../../lib/date';
import { daysInRange, intensityTier, maxAbsNet, summarize } from '../../lib/pnl';
import { formatCurrency, formatPnL } from '../../lib/format';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const HEAT = {
  profit: ['bg-white/8', 'bg-profit/35', 'bg-profit/60', 'bg-profit'],
  loss: ['bg-white/8', 'bg-loss/35', 'bg-loss/60', 'bg-loss'],
};

function mask(hidden, value) {
  return hidden ? '••••' : value;
}

function money(value) {
  return formatCurrency(value);
}

function buildWeekdayMonthGrid(year, month) {
  const lastDate = daysInMonth(year, month);
  const firstWd = weekdayIndex(new Date(year, month, 1));
  const cells = [];
  if (firstWd < 5) {
    for (let i = 0; i < firstWd; i += 1) cells.push({ key: `lead-${i}`, empty: true });
  }
  for (let d = 1; d <= lastDate; d += 1) {
    const date = new Date(year, month, d);
    if (weekdayIndex(date) >= 5) continue;
    const iso = toISODate(date);
    cells.push({ key: iso, empty: false, iso, day: d, date });
  }
  while (cells.length % 5 !== 0) cells.push({ key: `trail-${cells.length}`, empty: true });
  return cells;
}

function weekdayWeek(focus) {
  const start = startOfWeek(focus);
  return Array.from({ length: 5 }, (_, i) => {
    const date = addDays(start, i);
    return { date, iso: toISODate(date) };
  });
}

function NumberSheet({ title, value, onSave, onClose }) {
  const [draft, setDraft] = useState(String(value ?? ''));
  return (
    <div className="mj-sheet-root">
      <button type="button" className="mj-sheet-backdrop" onClick={onClose} aria-label="Close" />
      <div className="mj-sheet">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{title}</p>
          <button type="button" onClick={onClose} className="mj-icon-btn" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <input
          autoFocus
          type="number"
          min="0"
          step="1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mj-input"
        />
        <button
          type="button"
          className="mj-save"
          onClick={() => {
            const n = Number(draft);
            if (Number.isFinite(n) && n >= 0) onSave(n);
            onClose();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function AccountSheet({ onClose }) {
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const setSelectedAccount = useAppStore((s) => s.setSelectedAccount);

  return (
    <div className="mj-sheet-root">
      <button type="button" className="mj-sheet-backdrop" onClick={onClose} aria-label="Close" />
      <div className="mj-sheet">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Account</p>
          <button type="button" onClick={onClose} className="mj-icon-btn" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-1.5">
          {accounts.map((account) => {
            const active = account.id === selectedAccountId;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => {
                  setSelectedAccount(account.id);
                  onClose();
                }}
                className={clsx('mj-account-row', active && 'mj-account-row-active')}
              >
                <span>{account.name}</span>
                {active && <Check size={16} className="text-profit" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniMonth({ name, start, grid, maxAbs, dailyMap, empty, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(start)} className="mj-month-card">
      <p className="mb-2 text-center text-[13px] font-medium text-white/70">{name}</p>
      <div className="grid grid-cols-7 gap-[3px]">
        {grid.map((c) => {
          if (!c.inMonth) return <span key={c.iso} className="aspect-square" />;
          const day = dailyMap.get(c.iso);
          const tone = day?.trades ? (day.net >= 0 ? 'profit' : 'loss') : null;
          return (
            <span
              key={c.iso}
              className={clsx(
                'aspect-square rounded-[3px]',
                tone ? HEAT[tone][intensityTier(day.net, maxAbs)] : 'bg-white/[0.06]',
              )}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-white/35">{empty ? '—' : ''}</p>
    </button>
  );
}

export default function MobileJournal() {
  const viewRange = useAppStore((s) => s.viewRange);
  const setViewRange = useAppStore((s) => s.setViewRange);
  const focusIso = useAppStore((s) => s.focusDate);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const shiftPeriod = useAppStore((s) => s.shiftPeriod);
  const drillInto = useAppStore((s) => s.drillInto);
  const openDayDetails = useAppStore((s) => s.openDayDetails);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const monthlyGoal = useAppStore((s) => s.monthlyGoal);
  const yearlyGoal = useAppStore((s) => s.yearlyGoal);
  const lifetimeGoal = useAppStore((s) => s.lifetimeGoal);
  const startingCapital = useAppStore((s) => s.startingCapital);
  const setMonthlyGoal = useAppStore((s) => s.setMonthlyGoal);
  const setYearlyGoal = useAppStore((s) => s.setYearlyGoal);
  const setLifetimeGoal = useAppStore((s) => s.setLifetimeGoal);
  const setStartingCapital = useAppStore((s) => s.setStartingCapital);
  const hidePnL = useAppStore((s) => s.hidePnL);
  const setHidePnL = useAppStore((s) => s.setHidePnL);

  const dailyMap = useDailyMap();
  const period = usePeriodSummary();
  const focus = useMemo(() => parseISODate(focusIso), [focusIso]);
  const today = todayISO();
  const canNavigate = viewRange !== 'all';

  const [sheet, setSheet] = useState(null);

  const account = accounts.find((a) => a.id === selectedAccountId) ?? accounts[0];

  const weekRows = useMemo(() => weekdayWeek(focus), [focus]);

  const weekDays = useMemo(
    () => weekRows.map((r) => dailyMap.get(r.iso)).filter(Boolean),
    [weekRows, dailyMap],
  );
  const weekSummary = useMemo(() => summarize(weekDays), [weekDays]);
  const weekMaxAbs = useMemo(() => maxAbsNet(weekDays), [weekDays]);

  const displaySummary = viewRange === 'week' ? weekSummary : period.summary;
  const allTime = useMemo(() => summarize([...dailyMap.values()]), [dailyMap]);

  const capital = startingCapital || 0;
  const balance = capital + allTime.net;
  const retPct = capital ? (allTime.net / capital) * 100 : 0;

  const goalMeta = useMemo(() => {
    if (viewRange === 'all') {
      return { label: 'Lifetime goal', target: lifetimeGoal || 50000, current: allTime.net, kind: 'lifetime' };
    }
    if (viewRange === 'year') {
      return {
        label: 'Yearly goal',
        target: yearlyGoal || monthlyGoal * 12,
        current: period.summary.net,
        kind: 'yearly',
      };
    }
    return { label: 'Monthly goal', target: monthlyGoal, current: displaySummary.net, kind: 'monthly' };
  }, [viewRange, lifetimeGoal, yearlyGoal, monthlyGoal, allTime.net, period.summary.net, displaySummary.net]);

  const goalPct = goalMeta.target ? Math.max(0, Math.min(100, (goalMeta.current / goalMeta.target) * 100)) : 0;

  const periodLabel = useMemo(() => {
    if (viewRange === 'week') {
      const s = weekRows[0].date;
      const e = weekRows[4].date;
      const left = `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}`;
      const right =
        s.getMonth() === e.getMonth() ? `${e.getDate()}` : `${MONTH_SHORT[e.getMonth()]} ${e.getDate()}`;
      return `${left} – ${right}, ${e.getFullYear()}`;
    }
    return period.label;
  }, [viewRange, weekRows, period.label]);

  const sessionsLine = useMemo(() => {
    if (viewRange === 'all') return 'Across all years';
    const sessions = displaySummary.tradingDays;
    const green = displaySummary.greenDays;
    return `${sessions} session${sessions === 1 ? '' : 's'} · ${green} green`;
  }, [viewRange, displaySummary]);

  const handleSelectDay = (iso) => {
    if (dailyMap.get(iso)?.trades) openDayDetails(iso);
    else openAddTransaction({ date: iso });
  };

  const shareSummary = async () => {
    const text = `Journal · ${periodLabel}\nTotal P&L ${formatPnL(displaySummary.net)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Journal', text });
      else await navigator.clipboard.writeText(text);
    } catch {
      /* user cancelled */
    }
  };

  const yearMonths = useMemo(() => {
    if (viewRange !== 'year') return [];
    const year = focus.getFullYear();
    const yearDays = daysInRange(dailyMap, `${year}-01-01`, `${year}-12-31`);
    const maxAbs = maxAbsNet(yearDays);
    return MONTH_SHORT.map((name, m) => {
      const start = toISODate(new Date(year, m, 1));
      const end = toISODate(new Date(year, m + 1, 0));
      const summary = summarize(daysInRange(dailyMap, start, end));
      return { name, start, maxAbs, summary, grid: buildMonthGrid(year, m) };
    });
  }, [viewRange, dailyMap, focus]);

  const years = useMemo(() => {
    const isoKeys = [...dailyMap.keys()].sort();
    const currentYear = new Date().getFullYear();
    const first = isoKeys.length ? Number(isoKeys[0].slice(0, 4)) : currentYear;
    const last = Math.max(currentYear, isoKeys.length ? Number(isoKeys[isoKeys.length - 1].slice(0, 4)) : currentYear);
    const out = [];
    for (let y = last; y >= first; y -= 1) {
      out.push({ year: y, summary: summarize(daysInRange(dailyMap, `${y}-01-01`, `${y}-12-31`)) });
    }
    return out;
  }, [dailyMap]);

  const monthCells = useMemo(() => {
    if (viewRange !== 'month') return [];
    return buildWeekdayMonthGrid(focus.getFullYear(), focus.getMonth());
  }, [viewRange, focus]);

  const monthExtremes = useMemo(() => {
    const days = monthCells.filter((c) => !c.empty).map((c) => dailyMap.get(c.iso)).filter(Boolean);
    const s = summarize(days);
    return {
      best: s.bestDay?.net > 0 ? s.bestDay.iso : null,
      worst: s.worstDay?.net < 0 ? s.worstDay.iso : null,
    };
  }, [monthCells, dailyMap]);

  useEffect(() => {
    if (!canNavigate) return undefined;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === 'ArrowLeft') shiftPeriod(-1);
      if (e.key === 'ArrowRight') shiftPeriod(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canNavigate, shiftPeriod]);

  const saveGoal = (n) => {
    if (goalMeta.kind === 'lifetime') setLifetimeGoal(n);
    else if (goalMeta.kind === 'yearly') setYearlyGoal(n);
    else setMonthlyGoal(n);
  };

  return (
    <div className="mj-home">
      <header className="mj-home-header">
        <h1>Zxtrade</h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSheet('account')} className="mj-account-label">
            {account?.name || 'Main Account'}
          </button>
          <button type="button" onClick={() => openAddTransaction()} className="mj-plus" aria-label="Add trade">
            <Plus size={18} strokeWidth={2.6} />
          </button>
        </div>
      </header>

      <div className="mj-range" role="tablist" aria-label="Time range">
        {VIEW_RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={viewRange === r.id}
            onClick={() => setViewRange(r.id)}
            className={clsx('mj-range-item', viewRange === r.id && 'mj-range-item-active')}
          >
            {r.label}
          </button>
        ))}
      </div>

      {canNavigate && (
        <div className="mj-period">
          <button type="button" onClick={() => shiftPeriod(-1)} className="mj-period-nav" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <p>{periodLabel}</p>
          <button type="button" onClick={() => shiftPeriod(1)} className="mj-period-nav" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <div className="mj-hero">
        <div className="mj-pnl-card">
          <div className="mj-pnl-top">
            <span>Total P&L</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={shareSummary} className="mj-icon-btn" aria-label="Share">
                <Share2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setHidePnL(!hidePnL)}
                className="mj-icon-btn"
                aria-label={hidePnL ? 'Show amounts' : 'Hide amounts'}
              >
                {hidePnL ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <p className={clsx('mj-pnl-value', displaySummary.net < 0 && 'is-loss')}>
            {mask(hidePnL, formatPnL(displaySummary.net))}
          </p>
          <p className="mj-pnl-sub">{sessionsLine}</p>
        </div>

        <div className="mj-goal-card">
          <div className="mj-pnl-top">
            <span>{goalMeta.label}</span>
            <button type="button" onClick={() => setSheet('goal')} className="mj-icon-btn" aria-label="Edit goal">
              <Pencil size={13} />
            </button>
          </div>
          <div className="mj-goal-bar">
            <div className="mj-goal-fill" style={{ width: `${Math.max(goalPct, goalPct > 0 ? 2 : 0)}%` }}>
              <span className="mj-goal-dot" />
            </div>
          </div>
          <div className="mj-goal-meta">
            <span className="text-profit">{mask(hidePnL, formatPnL(goalMeta.current))}</span>
            <span>{mask(hidePnL, money(goalMeta.target))}</span>
          </div>
        </div>
      </div>

      <div className="mj-stats">
        <button type="button" className="mj-stat" onClick={() => setSheet('capital')}>
          <span>
            Capital <Pencil size={10} className="inline opacity-70" />
          </span>
          <strong>{mask(hidePnL, money(capital))}</strong>
        </button>
        <div className="mj-stat">
          <span>Balance</span>
          <strong>{mask(hidePnL, money(balance))}</strong>
        </div>
        <div className="mj-stat mj-stat-return">
          <span>Return</span>
          <strong className={retPct >= 0 ? 'text-profit' : 'text-loss'}>
            {mask(hidePnL, `${retPct >= 0 ? '+' : ''}${retPct.toFixed(2)}%`)}
          </strong>
        </div>
      </div>

      <div className="mj-body">
        {viewRange === 'week' && (
          <div className="space-y-2">
            {weekRows.map(({ iso, date }) => {
              const day = dailyMap.get(iso);
              const active = day && day.trades > 0;
              const positive = active && day.net >= 0;
              const dow = WEEKDAYS[weekdayIndex(date)];
              const barWidth = active && weekMaxAbs ? Math.max(8, (Math.abs(day.net) / weekMaxAbs) * 100) : 0;
              const title = active ? day.items.slice(0, 2).map((t) => t.title).join(' · ') : '';
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelectDay(iso)}
                  className={clsx(
                    'mj-week-row',
                    iso === selectedDate && 'is-selected',
                    iso === today && 'is-today',
                    active && positive && 'is-profit',
                    active && !positive && 'is-loss',
                  )}
                >
                  <div className="mj-week-date">
                    <small>{dow}</small>
                    <span>{date.getDate()}</span>
                  </div>
                  {active ? (
                    <>
                      <div className="mj-week-main">
                        <div className="mj-week-bar">
                          <span style={{ width: `${barWidth}%` }} />
                        </div>
                        <p>{title || `${day.trades} trade${day.trades === 1 ? '' : 's'}`}</p>
                      </div>
                      <p className="mj-week-pnl">{mask(hidePnL, formatPnL(day.net))}</p>
                    </>
                  ) : (
                    <p className="flex-1 text-[13px] text-white/35">{iso > today ? 'Upcoming' : 'No Trades'}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {viewRange === 'month' && (
          <>
            <div className="mb-3 flex items-center justify-between text-[13px]">
              <span className="text-white/45">Weekdays only</span>
              <span className="font-medium text-profit">
                {displaySummary.tradingDays} session{displaySummary.tradingDays === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mb-2 grid grid-cols-5 gap-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium tracking-[0.08em] text-white/35">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {monthCells.map((cell) => {
                if (cell.empty) return <div key={cell.key} className="mj-day-cell is-empty" />;
                const day = dailyMap.get(cell.iso);
                const active = day && day.trades > 0;
                const profit = active && day.net >= 0;
                const extreme = cell.iso === monthExtremes.best ? 'best' : cell.iso === monthExtremes.worst ? 'worst' : null;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => handleSelectDay(cell.iso)}
                    className={clsx(
                      'mj-day-cell',
                      cell.iso === selectedDate && 'is-selected',
                      cell.iso === today && 'is-today',
                      active && profit && 'is-profit',
                      active && !profit && 'is-loss',
                    )}
                  >
                    <span className="mj-day-num">{cell.day}</span>
                    {active ? (
                      <div className="mj-day-foot">
                        <div className="mj-day-foot-row">
                          <span className="mj-day-pnl">{mask(hidePnL, formatPnL(day.net, { compact: true, compactFrom: 1000 }))}</span>
                          {extreme === 'best' && <Trophy size={12} aria-hidden="true" />}
                          {extreme === 'worst' && <TrendingDown size={12} aria-hidden="true" />}
                        </div>
                        <span className="mj-day-trades">
                          {day.trades} {day.trades === 1 ? 'Trade' : 'Trades'}
                        </span>
                      </div>
                    ) : (
                      <span className="mj-day-pnl">—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {viewRange === 'year' && (
          <div className="grid grid-cols-3 gap-2.5">
            {yearMonths.map((m) => (
              <MiniMonth
                key={m.name}
                name={m.name}
                start={m.start}
                grid={m.grid}
                maxAbs={m.maxAbs}
                dailyMap={dailyMap}
                empty={m.summary.tradingDays === 0}
                onOpen={(iso) => drillInto('month', iso)}
              />
            ))}
          </div>
        )}

        {viewRange === 'all' && (
          <div className="space-y-2">
            {years.map(({ year, summary }) => (
              <button
                key={year}
                type="button"
                onClick={() => drillInto('year', `${year}-01-01`)}
                className="mj-year-row"
              >
                <div>
                  <p className="text-[22px] font-semibold leading-none text-white">{year}</p>
                  <p className="mt-1 text-[13px] text-white/40">
                    {summary.tradingDays} session{summary.tradingDays === 1 ? '' : 's'}
                  </p>
                </div>
                <p className={clsx('text-[20px] font-semibold tabular', summary.net >= 0 ? 'text-profit' : 'text-loss')}>
                  {mask(hidePnL, formatPnL(summary.net))}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {sheet === 'account' && <AccountSheet onClose={() => setSheet(null)} />}
      {sheet === 'goal' && (
        <NumberSheet title={goalMeta.label} value={goalMeta.target} onSave={saveGoal} onClose={() => setSheet(null)} />
      )}
      {sheet === 'capital' && (
        <NumberSheet
          title="Starting capital"
          value={startingCapital}
          onSave={setStartingCapital}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
