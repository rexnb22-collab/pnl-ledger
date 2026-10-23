import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { CalendarCheck, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarNotices from './CalendarNotices';
import { useAppStore } from '../../store/useAppStore';
import { useDailyMap, usePeriodSummary } from '../../hooks/usePnL';
import { useIsPhone } from '../../hooks/useMediaQuery';
import { parseISODate } from '../../lib/date';
import { formatPercent, formatPnL } from '../../lib/format';
import MonthGrid from './MonthGrid';
import WeekList from './WeekList';
import YearOverview from './YearOverview';
import AllTimeOverview from './AllTimeOverview';
import MobileJournal from '../mobile/MobileJournal';

function SummaryChip({ label, value, tone }) {
  const glowStyle = tone === 'profit' ? '0 0 30px -5px rgba(0, 255, 136, 0.3)' : tone === 'loss' ? '0 0 30px -5px rgba(255, 71, 87, 0.3)' : '0 0 30px -5px rgba(0, 255, 136, 0.2)';
  return (
    <div className="rounded-xl border border-white/8 bg-black/30 backdrop-blur-xl px-4 py-2 shadow-sm" style={{ boxShadow: glowStyle }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">{label}</p>
      <p className={clsx('text-base font-bold tabular', tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss', tone === 'accent' && 'text-accent')}>
        {value}
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-2xs text-fg-subtle">
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-profit/70" /> Profit</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-loss/70" /> Loss</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-surface-neutral ring-1 ring-line-strong" /> No trades</span>
    </div>
  );
}

export default function PnLCalendar() {
  const isPhone = useIsPhone();
  const viewRange = useAppStore((s) => s.viewRange);
  const focusIso = useAppStore((s) => s.focusDate);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const shiftPeriod = useAppStore((s) => s.shiftPeriod);
  const goToToday = useAppStore((s) => s.goToToday);
  const drillInto = useAppStore((s) => s.drillInto);
  const openDayDetails = useAppStore((s) => s.openDayDetails);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  const dailyMap = useDailyMap();
  const { summary, label } = usePeriodSummary();
  const focus = useMemo(() => parseISODate(focusIso), [focusIso]);
  const canNavigate = viewRange !== 'all';

  // ← / → step through periods (ignored while typing in a field).
  useEffect(() => {
    if (isPhone || !canNavigate) return undefined;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === 'ArrowLeft') shiftPeriod(-1);
      if (e.key === 'ArrowRight') shiftPeriod(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPhone, canNavigate, shiftPeriod]);

  if (isPhone) return <MobileJournal />;

  // Days with trades open their details; empty days go straight to a new entry for that date.
  const handleSelectDay = (iso) => {
    if (dailyMap.get(iso)?.trades) openDayDetails(iso);
    else openAddTransaction({ date: iso });
  };

  return (
    <section className="card flex min-h-[calc(100vh-theme(spacing.topbar)-2.5rem)] flex-col p-5 border-t-2 border-profit shadow-glow-profit/20">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {canNavigate && (
            <div className="flex items-center rounded-lg border border-white/8 bg-black/30 backdrop-blur-xl p-0.5" style={{ boxShadow: '0 0 30px -5px rgba(0, 255, 136, 0.25)' }}>
              <button type="button" onClick={() => shiftPeriod(-1)} className="btn-icon h-8 w-8" aria-label="Previous period">
                <ChevronLeft size={17} />
              </button>
              <button type="button" onClick={() => shiftPeriod(1)} className="btn-icon h-8 w-8" aria-label="Next period">
                <ChevronRight size={17} />
              </button>
            </div>
          )}
          <h2 key={label} className="min-w-[10rem] animate-fade-up px-1 text-xl font-semibold tracking-tight">{label}</h2>
          {canNavigate && (
            <button type="button" onClick={goToToday} className="btn-ghost h-8 px-2.5 text-xs">
              <CalendarCheck size={14} /> Today
            </button>
          )}
          <button
            type="button"
            onClick={() => openAddTransaction()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-profit px-2.5 text-xs font-bold text-ink-950"
          >
            <Plus size={14} strokeWidth={3} /> Add trade
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SummaryChip label="Net PnL" value={formatPnL(summary.net)} tone={summary.net >= 0 ? 'profit' : 'loss'} />
          <SummaryChip label="Green / Red days" value={`${summary.greenDays} / ${summary.redDays}`} />
          <SummaryChip label="Win rate" value={formatPercent(summary.winRate)} tone="accent" />
        </div>
      </header>

      <CalendarNotices />

      <div key={`${viewRange}-${label}`} className="flex flex-1 animate-fade-up flex-col">
        {viewRange === 'month' && <MonthGrid focus={focus} dailyMap={dailyMap} selectedDate={selectedDate} onSelect={handleSelectDay} />}
        {viewRange === 'week' && <WeekList focus={focus} dailyMap={dailyMap} selectedDate={selectedDate} onSelect={handleSelectDay} />}
        {viewRange === 'year' && <YearOverview focus={focus} dailyMap={dailyMap} onOpenMonth={(iso) => drillInto('month', iso)} />}
        {viewRange === 'all' && <AllTimeOverview dailyMap={dailyMap} onOpenYear={(iso) => drillInto('year', iso)} />}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <Legend />
        <p className="text-2xs text-fg-subtle">
          {viewRange === 'month' || viewRange === 'week' ? 'Click a day to add or manage trades · ← → to navigate' : 'Click a card to drill in'}
        </p>
      </footer>
    </section>
  );
}
