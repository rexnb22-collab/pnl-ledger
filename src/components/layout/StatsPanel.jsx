import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Flame, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useMonthlyGoal, usePeriodSummary } from '../../hooks/usePnL';
import { formatShortDate, todayISO } from '../../lib/date';
import { formatChange, formatCurrencyWhole, formatPercent, formatPnL } from '../../lib/format';

function Metric({ label, value, tone }) {
  const glowStyle = tone === 'profit' ? '0 0 40px -8px rgba(0, 255, 163, 0.35)' : tone === 'loss' ? '0 0 40px -8px rgba(255, 45, 85, 0.35)' : '0 0 40px -8px rgba(0, 255, 163, 0.25)';
  return (
    <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-2xl px-3 py-2.5 shadow-sm" style={{ boxShadow: glowStyle }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-fg-subtle">{label}</p>
      <p className={clsx('mt-1 truncate text-sm font-bold tracking-tight tabular', tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss', tone === 'accent' && 'text-accent')}>
        {value}
      </p>
    </div>
  );
}

function AnalyticsOverviewCard({ summary, change, series, label }) {
  const positive = summary.net >= 0;
  const stroke = positive ? '#00FFA3' : '#FF2D55';
  return (
    <div className="card relative overflow-hidden border-t-2" style={{ borderTopColor: positive ? '#00FFA3' : '#FF2D55' }}>
      <div className={clsx('pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl', positive ? 'bg-profit/15' : 'bg-loss/15')} />
      <div className="card-header">
        <span className="card-title">Analytics Overview</span>
        {change !== null && (
          <span className={change >= 0 ? 'badge-profit' : 'badge-loss'} title="vs previous period">
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatChange(change)}
          </span>
        )}
      </div>
      <div className="px-4">
        <p className="text-xs font-bold text-fg-subtle">Net PnL · {label}</p>
        <p className={clsx('mt-2 text-[32px] font-black leading-none tracking-tight tabular', positive ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss')}>
          {formatPnL(summary.net)}
        </p>
      </div>
      <div className="mt-3 h-16">
        {series.length > 1 && (
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 286, height: 64 }}>
            <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pnlSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2.5} fill="url(#pnlSpark)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-4 pt-3">
        <Metric label="Revenue" value={formatPnL(summary.revenue, { compact: true, compactFrom: 1000 })} tone="profit" />
        <Metric label="Expenses" value={formatPnL(-summary.expenses, { compact: true, compactFrom: 1000 })} tone="loss" />
        <Metric label="Win Rate" value={formatPercent(summary.winRate)} tone="accent" />
      </div>
    </div>
  );
}

function GoalProgressCard() {
  const { net, target, pct, label, end } = useMonthlyGoal();
  const remaining = Math.max(0, target - net);
  const closed = end < todayISO();
  const isCompleted = pct >= 100;
  
  return (
    <div className="card border-t-2 border-profit">
      <div className="card-header">
        <span className="card-title">تقدم الهدف</span>
        <span className="text-2xs text-fg-subtle">{label}</span>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-4 flex items-end justify-between">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Target size={16} className="text-profit" /> الهدف الشهري
          </span>
          <span className={`text-2xl font-black tabular ${isCompleted ? 'text-profit text-glow-profit' : 'text-profit text-glow-profit'}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative h-4 overflow-hidden rounded-full bg-black/40 ring-1 ring-inset ring-white/15">
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-profit/10 via-profit/5 to-transparent opacity-50" />
          
          {/* Progress fill */}
          <div 
            key={label} 
            className={`h-full rounded-full relative transition-all duration-700 ease-out ${
              isCompleted 
                ? 'bg-gradient-to-r from-profit via-profit-bright to-profit shadow-glow-profit animate-pulse-glow' 
                : 'bg-gradient-to-r from-profit-deep via-profit to-profit-bright shadow-glow-profit'
            }`}
            style={{ width: `${Math.min(100, pct)}%` }}
          >
            {/* Animated shine effect */}
            {!isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
            
            {/* Progress indicator dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 rounded-full bg-white shadow-lg" />
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-black/30 backdrop-blur-xl p-3 border border-white/6">
            <p className="text-2xs text-fg-subtle font-bold uppercase tracking-wider mb-1">المحصل</p>
            <p className="text-lg font-black text-fg tabular">{formatCurrencyWhole(net)}</p>
          </div>
          <div className="rounded-xl bg-black/30 backdrop-blur-xl p-3 border border-white/6">
            <p className="text-2xs text-fg-subtle font-bold uppercase tracking-wider mb-1">الهدف</p>
            <p className="text-lg font-black text-fg tabular">{formatCurrencyWhole(target)}</p>
          </div>
          <div className="rounded-xl bg-black/30 backdrop-blur-xl p-3 border border-white/6">
            <p className="text-2xs text-fg-subtle font-bold uppercase tracking-wider mb-1">المتبقي</p>
            <p className={`text-lg font-black tabular ${isCompleted ? 'text-profit' : remaining > 0 ? 'text-fg' : 'text-profit'}`}>
              {isCompleted ? '✓' : formatCurrencyWhole(remaining)}
            </p>
          </div>
        </div>
        
        {/* Status message */}
        <div className="mt-3 text-center">
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-profit/20 border border-profit/40 px-4 py-2 text-xs font-bold text-profit">
              <Target size={14} className="animate-bounce" />
              <span>مبروك! الهدف محقق</span>
            </div>
          ) : closed ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-loss/20 border border-loss/40 px-4 py-2 text-xs font-bold text-loss">
              <span>نقص {formatCurrencyWhole(remaining)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-xs font-bold text-fg-subtle">
              <span>باقي {formatCurrencyWhole(remaining)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, sub, tone }) {
  const glowStyle = tone === 'profit' ? '0 0 40px -8px rgba(0, 255, 163, 0.35)' : tone === 'loss' ? '0 0 40px -8px rgba(255, 45, 85, 0.35)' : '0 0 40px -8px rgba(0, 255, 163, 0.25)';
  return (
    <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-2xl p-3.5 transition-all duration-250 hover:border-white/12 hover:shadow-lg" style={{ boxShadow: glowStyle }}>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-fg-subtle">
        <Icon size={15} className={clsx(tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss', tone === 'accent' && 'text-accent')} />
        {label}
      </div>
      <p className={clsx('truncate text-base font-bold tabular', tone === 'profit' && 'text-profit', tone === 'loss' && 'text-loss')}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-fg-subtle">{sub}</p>}
    </div>
  );
}

function QuickStatsCard({ summary }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Quick Stats</span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <QuickStat icon={Flame} label="Daily avg PnL" value={formatPnL(summary.avgDaily)} tone={summary.avgDaily >= 0 ? 'profit' : 'loss'} />
        <QuickStat icon={CalendarDays} label="Trading days" value={summary.tradingDays} sub={`${summary.trades.toLocaleString()} trades`} tone="accent" />
        <QuickStat icon={TrendingUp} label="Highest profit" value={summary.bestDay ? formatPnL(summary.bestDay.net) : '—'} sub={summary.bestDay && formatShortDate(summary.bestDay.iso)} tone="profit" />
        <QuickStat icon={TrendingDown} label="Highest loss" value={summary.worstDay && summary.worstDay.net < 0 ? formatPnL(summary.worstDay.net) : '—'} sub={summary.worstDay?.net < 0 ? formatShortDate(summary.worstDay.iso) : null} tone="loss" />
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const { summary, change, series, label } = usePeriodSummary();
  return (
    <aside className="flex h-full w-panel shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/6 bg-black/40 backdrop-blur-3xl p-5" style={{ boxShadow: '0 0 100px -25px rgba(0, 255, 163, 0.12)' }}>
      <AnalyticsOverviewCard summary={summary} change={change} series={series} label={label} />
      <GoalProgressCard />
      <QuickStatsCard summary={summary} />
    </aside>
  );
}
