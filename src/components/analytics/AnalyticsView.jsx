import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  Scale,
  Percent,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useIsPhone } from '../../hooks/useMediaQuery';
import { formatCurrency, formatPnL } from '../../lib/format';
import MobileAnalytics from './MobileAnalytics';

export default function AnalyticsView() {
  const transactions = useAppStore((s) => s.transactions);
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const setSelectedAccount = useAppStore((s) => s.setSelectedAccount);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);

  const selectedTraderId = useAppStore((s) => s.selectedTraderId);
  const setSelectedTraderId = useAppStore((s) => s.setSelectedTraderId);
  const traders = useAppStore((s) => s.traders);

  const [timeRange, setTimeRange] = useState('all'); // 'all', 'year', 'month', '30d'
  const isPhone = useIsPhone();

  // Filter transactions by selected account and selected trader
  const accountScoped = useMemo(() => {
    let scoped = transactions;
    if (selectedAccountId !== 'all') {
      scoped = scoped.filter((t) => t.accountId === selectedAccountId);
    }
    if (selectedTraderId !== 'all') {
      scoped = scoped.filter((t) => (t.traderId || 'trader_1') === selectedTraderId);
    }
    return scoped;
  }, [transactions, selectedAccountId, selectedTraderId]);

  // Head-to-Head 2-Trader comparison
  const partnerComparison = useMemo(() => {
    const t1Txs = transactions.filter((t) => (t.traderId || 'trader_1') === 'trader_1');
    const t2Txs = transactions.filter((t) => t.traderId === 'trader_2');
    const getStats = (txs) => {
      const net = txs.reduce((sum, t) => sum + t.amount, 0);
      const wins = txs.filter((t) => t.amount > 0).length;
      const rate = txs.length ? Math.round((wins / txs.length) * 100) : 0;
      return { net: Math.round(net * 100) / 100, trades: txs.length, wins, rate };
    };
    return {
      t1: getStats(t1Txs),
      t2: getStats(t2Txs),
    };
  }, [transactions]);

  // Filter by time range
  const filteredTxs = useMemo(() => {
    if (timeRange === 'all') return accountScoped;
    const now = new Date();
    const nowIso = now.toISOString().split('T')[0];

    if (timeRange === '30d') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      const startIso = d.toISOString().split('T')[0];
      return accountScoped.filter((t) => t.date >= startIso && t.date <= nowIso);
    }
    if (timeRange === 'month') {
      const startIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return accountScoped.filter((t) => t.date >= startIso && t.date <= nowIso);
    }
    if (timeRange === 'year') {
      const startIso = `${now.getFullYear()}-01-01`;
      return accountScoped.filter((t) => t.date >= startIso && t.date <= nowIso);
    }
    return accountScoped;
  }, [accountScoped, timeRange]);

  // Daily groupings & stats
  const {
    summary,
    equityData,
    dailyBarData,
    categoryData,
    dayOfWeekData,
    winStreak,
    avgWin,
    avgLoss,
  } = useMemo(() => {
    // Sort transactions by date asc
    const sorted = [...filteredTxs].sort((a, b) => (a.date < b.date ? -1 : 1));

    const dayMap = new Map();
    for (const t of sorted) {
      if (!dayMap.has(t.date)) {
        dayMap.set(t.date, { date: t.date, net: 0, wins: 0, losses: 0, trades: 0 });
      }
      const day = dayMap.get(t.date);
      day.net += t.amount;
      day.trades += 1;
      if (t.amount > 0) day.wins += 1;
      else if (t.amount < 0) day.losses += 1;
    }

    const days = Array.from(dayMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));

    // Calculate streaks & averages
    let winsTotal = 0;
    let winSum = 0;
    let lossesTotal = 0;
    let lossSum = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    for (const t of sorted) {
      if (t.amount > 0) {
        winsTotal++;
        winSum += t.amount;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (t.amount < 0) {
        lossesTotal++;
        lossSum += Math.abs(t.amount);
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }
    }

    // Cumulative equity
    let running = 0;
    const equity = days.map((d) => {
      running += d.net;
      return {
        date: d.date.slice(5), // MM-DD
        fullDate: d.date,
        pnl: Math.round(running * 100) / 100,
        daily: Math.round(d.net * 100) / 100,
      };
    });

    // Daily bars
    const dailyBars = days.map((d) => ({
      date: d.date.slice(5),
      fullDate: d.date,
      net: Math.round(d.net * 100) / 100,
    }));

    // Categories breakdown
    const catMap = new Map();
    for (const t of sorted) {
      const cat = t.category || 'Other';
      if (!catMap.has(cat)) {
        catMap.set(cat, { name: cat, pnl: 0, trades: 0, wins: 0 });
      }
      const item = catMap.get(cat);
      item.pnl += t.amount;
      item.trades += 1;
      if (t.amount > 0) item.wins += 1;
    }
    const cats = Array.from(catMap.values())
      .map((c) => ({
        ...c,
        pnl: Math.round(c.pnl * 100) / 100,
        winRate: c.trades ? Math.round((c.wins / c.trades) * 100) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    // Day of week
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowMap = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ day: daysName[i], pnl: 0, trades: 0 }));
    for (const t of sorted) {
      const dow = new Date(t.date + 'T12:00:00').getDay();
      dowMap[dow].pnl += t.amount;
      dowMap[dow].trades += 1;
    }
    // Filter to trading days (Mon-Fri plus weekend if any)
    const dowFiltered = dowMap.filter((d) => d.trades > 0 || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d.day));

    // Summary calculations
    const grossProfit = winSum;
    const grossLoss = lossSum;
    const netPnL = grossProfit - grossLoss;
    const winRate = sorted.length ? (winsTotal / sorted.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
    const avgW = winsTotal > 0 ? winSum / winsTotal : 0;
    const avgL = lossesTotal > 0 ? lossSum / lossesTotal : 0;

    const bestDay = days.reduce((best, d) => (!best || d.net > best.net ? d : best), null);
    const worstDay = days.reduce((worst, d) => (!worst || d.net < worst.net ? d : worst), null);

    return {
      summary: {
        net: Math.round(netPnL * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossLoss: Math.round(grossLoss * 100) / 100,
        trades: sorted.length,
        wins: winsTotal,
        losses: lossesTotal,
        winRate: Math.round(winRate * 10) / 10,
        profitFactor: Math.round(profitFactor * 100) / 100,
        bestDay,
        worstDay,
      },
      equityData: equity,
      dailyBarData: dailyBars,
      categoryData: cats,
      dayOfWeekData: dowFiltered,
      winStreak: { current: currentStreak, max: maxStreak },
      avgWin: Math.round(avgW * 100) / 100,
      avgLoss: Math.round(avgL * 100) / 100,
    };
  }, [filteredTxs]);

  if (isPhone) {
    return (
      <MobileAnalytics
        empty={transactions.length === 0}
        openAddTransaction={openAddTransaction}
        summary={summary}
        equityData={equityData}
        dailyBarData={dailyBarData}
        categoryData={categoryData}
        dayOfWeekData={dayOfWeekData}
        winStreak={winStreak}
        avgWin={avgWin}
        avgLoss={avgLoss}
        isNetPositive={(summary?.net ?? 0) >= 0}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        selectedTraderId={selectedTraderId}
        setSelectedTraderId={setSelectedTraderId}
        selectedAccountId={selectedAccountId}
        setSelectedAccount={setSelectedAccount}
        accounts={accounts}
        partnerComparison={partnerComparison}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/25 glow-accent">
          <Sparkles size={26} />
        </div>
        <h2 className="text-xl font-bold">ما فيش تحليلات تداول بعد</h2>
        <p className="mt-2 text-sm text-fg-muted">
          سجل أول صفقة لك أو حمّل بيانات نموذجية من تبويب تصدير البيانات لتشاهد مقاييس الربح والخسارة التفصيلية، ومنحنيات الأسهم، وتحليلات الأداء.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => openAddTransaction()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30">
            <Sparkles size={16} strokeWidth={3} /> سجل صفقة
          </button>
        </div>
      </div>
    );
  }

  const isNetPositive = summary.net >= 0;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Trader scope switcher */}
          <div className="segmented">
            <button
              type="button"
              className="segmented-item"
              data-active={selectedTraderId === 'all'}
              onClick={() => setSelectedTraderId('all')}
            >
              👥 كاع المتداولين
            </button>
            <button
              type="button"
              className="segmented-item"
              data-active={selectedTraderId === 'trader_1'}
              onClick={() => setSelectedTraderId('trader_1')}
            >
              🟢 المتداول 1 (أنت)
            </button>
            <button
              type="button"
              className="segmented-item"
              data-active={selectedTraderId === 'trader_2'}
              onClick={() => setSelectedTraderId('trader_2')}
            >
              🔵 المتداول 2 (الشريك)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">الحساب:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="input h-8 w-auto py-1 pl-2.5 pr-8 text-xs font-medium"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time range tabs */}
        <div className="segmented">
          <button
            type="button"
            className="segmented-item"
            data-active={timeRange === 'all'}
            onClick={() => setTimeRange('all')}
          >
            كاع الوقت
          </button>
          <button
            type="button"
            className="segmented-item"
            data-active={timeRange === 'year'}
            onClick={() => setTimeRange('year')}
          >
            هاد العام
          </button>
          <button
            type="button"
            className="segmented-item"
            data-active={timeRange === 'month'}
            onClick={() => setTimeRange('month')}
          >
            هاد الشهر
          </button>
          <button
            type="button"
            className="segmented-item"
            data-active={timeRange === '30d'}
            onClick={() => setTimeRange('30d')}
          >
            آخر 30 يوم
          </button>
        </div>
      </div>

      {/* Head-to-Head 2-Trader Duo Comparison Card */}
      <div className="card p-4 bg-gradient-to-r from-surface to-surface-raised border-line-strong">
        <div className="flex items-center justify-between pb-3 border-b border-line/60">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-ink-950 font-bold text-xs">
              2T
            </span>
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider">
              مقارنة شراكة المتداولين
            </h3>
          </div>
          <span className="text-2xs text-fg-subtle">تحليلات الخزينة المشتركة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
          {/* Trader 1 */}
          <div className="rounded-lg border border-line bg-ink-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                <h4 className="text-xs font-bold text-fg">المتداول 1 (أنت)</h4>
              </div>
              <span className={`text-xs font-bold tabular ${partnerComparison.t1.net >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPnL(partnerComparison.t1.net)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-2xs text-fg-muted pt-1">
              <div>الصفقات: <strong className="text-fg">{partnerComparison.t1.trades}</strong></div>
              <div>الربح: <strong className="text-profit">{partnerComparison.t1.wins}</strong></div>
              <div>نسبة الربح: <strong className="text-fg">{partnerComparison.t1.rate}%</strong></div>
            </div>
          </div>

          {/* Trader 2 */}
          <div className="rounded-lg border border-line bg-ink-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <h4 className="text-xs font-bold text-fg">المتداول 2 (الشريك)</h4>
              </div>
              <span className={`text-xs font-bold tabular ${partnerComparison.t2.net >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPnL(partnerComparison.t2.net)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-2xs text-fg-muted pt-1">
              <div>الصفقات: <strong className="text-fg">{partnerComparison.t2.trades}</strong></div>
              <div>الربح: <strong className="text-profit">{partnerComparison.t2.wins}</strong></div>
              <div>نسبة الربح: <strong className="text-fg">{partnerComparison.t2.rate}%</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Net P&L */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>صافي الربح والخسارة</span>
            {isNetPositive ? (
              <TrendingUp size={14} className="text-profit" />
            ) : (
              <TrendingDown size={14} className="text-loss" />
            )}
          </div>
          <div
            className={`mt-2 text-xl font-bold tabular ${
              isNetPositive ? 'text-profit' : 'text-loss'
            }`}
          >
            {formatPnL(summary.net)}
          </div>
          <div className="mt-1 text-2xs text-fg-subtle">
            {summary.trades} صفقة مسجلة
          </div>
        </div>

        {/* Win Rate */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>نسبة الربح</span>
            <Percent size={14} className="text-accent" />
          </div>
          <div className="mt-2 text-xl font-bold tabular text-fg">
            {summary.winRate}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-2xs text-fg-subtle">
            <span className="text-profit font-bold">{summary.wins}ر</span>
            <span>/</span>
            <span className="text-loss font-bold">{summary.losses}خ</span>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>عامل الربح</span>
            <Scale size={14} className="text-accent" />
          </div>
          <div className="mt-2 text-xl font-bold tabular text-fg">
            {summary.profitFactor >= 99 ? '∞' : summary.profitFactor.toFixed(2)}
          </div>
          <div className="mt-1 text-2xs text-fg-subtle">
            الإجمالي: <span className="text-profit">+{formatCurrency(summary.grossProfit)}</span>
          </div>
        </div>

        {/* Avg Win vs Avg Loss */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>المخاطرة / العائد</span>
            <Award size={14} className="text-warn" />
          </div>
          <div className="mt-2 text-xl font-bold tabular text-fg">
            {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) + ' : 1' : 'N/A'}
          </div>
          <div className="mt-1 text-2xs text-fg-subtle">
            متوسط الربح: <span className="text-profit">+{formatCurrency(avgWin)}</span>
          </div>
        </div>

        {/* Best Day */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>أفضل يوم</span>
            <Award size={14} className="text-profit" />
          </div>
          <div className="mt-2 text-xl font-bold tabular text-profit">
            {summary.bestDay ? `+${formatCurrency(summary.bestDay.net)}` : '$0'}
          </div>
          <div className="mt-1 truncate text-2xs text-fg-subtle">
            {summary.bestDay ? summary.bestDay.date : 'ما فيش صفقات'}
          </div>
        </div>

        {/* Current / Max Streak */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-fg-muted">
            <span>أطول سلسلة</span>
            <Flame size={14} className="text-accent-bright" />
          </div>
          <div className="mt-2 text-xl font-bold tabular text-accent-bright">
            {winStreak.max} ربح
          </div>
          <div className="mt-1 text-2xs text-fg-subtle">
            الحالي: {winStreak.current > 0 ? `${winStreak.current}ر سلسلة` : winStreak.current < 0 ? `${Math.abs(winStreak.current)}خ سلسلة` : 'لا شيء'}
          </div>
        </div>
      </div>

      {/* Main Charts: Cumulative Equity & Daily Bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Equity Curve (2 cols) */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-fg">منحنى الأسهم التراكمي</h3>
              <p className="text-2xs text-fg-muted">تطور رصيد الحساب مع مرور الوقت</p>
            </div>
            <span className={`badge ${isNetPositive ? 'badge-profit' : 'badge-loss'}`}>
              {formatPnL(summary.net)}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isNetPositive ? '#22C55E' : '#EF4444'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isNetPositive ? '#22C55E' : '#EF4444'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card p-2.5 shadow-xl text-xs border-line-strong">
                          <p className="text-fg-muted font-medium mb-1">{data.fullDate}</p>
                          <p className="text-sm font-bold tabular text-fg">
                            Equity: <span className={data.pnl >= 0 ? 'text-profit' : 'text-loss'}>{formatPnL(data.pnl)}</span>
                          </p>
                          <p className="text-2xs text-fg-subtle">
                            Day Net: {formatPnL(data.daily)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke={isNetPositive ? '#22C55E' : '#EF4444'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="card p-5">
          <div className="pb-3">
            <h3 className="text-sm font-bold tracking-wide text-fg">الأداء حسب الفئة</h3>
            <p className="text-2xs text-fg-muted">العوائد الصافية ونسبة الربح حسب نوع الأصل</p>
          </div>

          <div className="mt-2 space-y-3 overflow-y-auto max-h-64 pr-1">
            {categoryData.length === 0 ? (
              <p className="text-xs text-fg-subtle py-8 text-center">ما فيش بيانات الفئات</p>
            ) : (
              categoryData.map((cat) => {
                const pos = cat.pnl >= 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between rounded-lg border border-line/60 bg-ink-900/60 p-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-fg">{cat.name}</span>
                        <span className="badge badge-neutral text-2xs">{cat.trades} صفقة</span>
                      </div>
                      <div className="mt-1 text-2xs text-fg-subtle">
                        نسبة الربح: <span className="text-fg font-medium">{cat.winRate}%</span>
                      </div>
                    </div>
                    <div className={`text-sm font-bold tabular ${pos ? 'text-profit' : 'text-loss'}`}>
                      {formatPnL(cat.pnl)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Daily PnL Bars & Day of Week */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily P&L Bars */}
        <div className="card p-5">
          <div className="pb-3">
            <h3 className="text-sm font-bold tracking-wide text-fg">توزيع الربح والخسارة اليومي</h3>
            <p className="text-2xs text-fg-muted">الربح والخسارة الصافية لكل جلسة تداول</p>
          </div>

          <div className="h-56 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card p-2 text-xs shadow-xl border-line-strong">
                          <p className="text-fg-muted font-medium">{data.fullDate}</p>
                          <p className={`text-sm font-bold tabular mt-0.5 ${data.net >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatPnL(data.net)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="net" radius={[3, 3, 0, 0]}>
                  {dailyBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.net >= 0 ? '#22C55E' : '#EF4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of Week */}
        <div className="card p-5">
          <div className="pb-3">
            <h3 className="text-sm font-bold tracking-wide text-fg">أداء أيام الأسبوع</h3>
            <p className="text-2xs text-fg-muted">تحديد أكثر أيام التداول ربحية</p>
          </div>

          <div className="h-56 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1F2937' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card p-2 text-xs shadow-xl border-line-strong">
                          <p className="text-fg font-medium">{data.day}</p>
                          <p className={`text-sm font-bold tabular mt-0.5 ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatPnL(data.pnl)}
                          </p>
                          <p className="text-2xs text-fg-subtle">{data.trades} trades</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {dayOfWeekData.map((entry, index) => (
                    <Cell
                      key={`dow-${index}`}
                      fill={entry.pnl >= 0 ? '#06B6D4' : '#F87171'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
