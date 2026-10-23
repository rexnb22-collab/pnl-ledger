import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { formatPnL } from '../../lib/format';

const TRADER_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'trader_1', label: 'أنت' },
  { id: 'trader_2', label: 'الشريك' },
];

const RANGE_TABS = [
  { id: 'all', label: 'الكل' },
  { id: 'year', label: 'عام' },
  { id: 'month', label: 'شهر' },
  { id: '30d', label: '30ي' },
];

function ChartTip({ label, value, sub }) {
  return (
    <div className="ma-tip">
      <p>{label}</p>
      <strong className={value >= 0 ? 'text-profit' : 'text-loss'}>{formatPnL(value)}</strong>
      {sub ? <span>{sub}</span> : null}
    </div>
  );
}

export default function MobileAnalytics({
  summary,
  equityData,
  dailyBarData,
  categoryData,
  dayOfWeekData,
  winStreak,
  avgWin,
  avgLoss,
  isNetPositive,
  timeRange,
  setTimeRange,
  selectedTraderId,
  setSelectedTraderId,
  selectedAccountId,
  setSelectedAccount,
  accounts,
  partnerComparison,
  empty,
  openAddTransaction,
}) {
  if (empty) {
    return (
      <div className="ma-empty">
        <div className="ma-empty-icon">
          <Sparkles size={18} />
        </div>
        <h2>ما كاينش تحليلات بعد</h2>
        <p>سجل أول صفقة باش تشوف المنحنى والمقاييس هنا.</p>
        <button type="button" onClick={() => openAddTransaction()} className="ma-empty-btn">
          سجل صفقة
        </button>
      </div>
    );
  }

  const compactEquity = equityData.slice(-18);
  const compactBars = dailyBarData.slice(-12);
  const topCats = categoryData.slice(0, 4);

  return (
    <div className="news-rtl ma-stack">
      <div className="mj-range mj-range-3" role="tablist" aria-label="المتداول">
        {TRADER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedTraderId === tab.id}
            onClick={() => setSelectedTraderId(tab.id)}
            className={`mj-range-item ${selectedTraderId === tab.id ? 'mj-range-item-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ma-toolbar">
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="ma-select"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <div className="mj-range ma-range" role="tablist" aria-label="الفترة">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={timeRange === tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`mj-range-item ${timeRange === tab.id ? 'mj-range-item-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mj-hero">
        <div className="mj-pnl-card">
          <div className="mj-pnl-top">
            <span>صافي الربح</span>
          </div>
          <p className={`mj-pnl-value ${isNetPositive ? '' : 'is-loss'}`}>{formatPnL(summary.net)}</p>
          <p className="mj-pnl-sub">{summary.trades} صفقة</p>
        </div>
        <div className="mj-goal-card">
          <div className="mj-pnl-top">
            <span>نسبة الربح</span>
          </div>
          <p className="ma-side-value">{summary.winRate}%</p>
          <p className="mj-pnl-sub">
            <span className="text-profit">{summary.wins}ر</span>
            {' · '}
            <span className="text-loss">{summary.losses}خ</span>
          </p>
        </div>
      </div>

      <div className="mj-stats">
        <div className="mj-stat">
          <span>عامل</span>
          <strong>{summary.profitFactor >= 99 ? '∞' : summary.profitFactor.toFixed(2)}</strong>
        </div>
        <div className="mj-stat">
          <span>عائد</span>
          <strong>{avgLoss > 0 ? `${(avgWin / avgLoss).toFixed(1)}:1` : '—'}</strong>
        </div>
        <div className="mj-stat">
          <span>سلسلة</span>
          <strong>{winStreak.max}ر</strong>
        </div>
      </div>

      <section className="mn-chart-card">
        <div className="mn-chart-head">
          <div>
            <p className="mn-kicker">EQUITY</p>
            <p className="ma-chart-title">منحنى الأسهم</p>
          </div>
          <span className={`ma-pill ${isNetPositive ? 'is-up' : 'is-down'}`}>{formatPnL(summary.net)}</span>
        </div>
        <div className="ma-chart" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={compactEquity} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="maEquityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isNetPositive ? '#3dffb0' : '#ff4d73'} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={isNetPositive ? '#3dffb0' : '#ff4d73'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.28)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
                tickMargin={6}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: 'rgba(61,255,176,0.28)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return <ChartTip label={d.fullDate} value={d.pnl} sub={`يوم: ${formatPnL(d.daily)}`} />;
                }}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke={isNetPositive ? '#3dffb0' : '#ff4d73'}
                strokeWidth={2}
                fill="url(#maEquityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mn-chart-card ma-chart-plain">
        <div className="mn-chart-head">
          <div>
            <p className="mn-kicker">DAILY</p>
            <p className="ma-chart-title">الربح اليومي</p>
          </div>
        </div>
        <div className="ma-chart ma-chart-sm" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compactBars} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.28)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={22}
                tickMargin={6}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return <ChartTip label={d.fullDate} value={d.net} />;
                }}
              />
              <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                {compactBars.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.net >= 0 ? '#3dffb0' : '#ff4d73'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="mn-section-head">
          <h3>مقارنة الشراكة</h3>
        </div>
        <div className="ma-pair">
          <article className="ma-pair-card">
            <div className="ma-pair-top">
              <span className="ma-dot is-you" />
              <h4>أنت</h4>
              <b className={partnerComparison.t1.net >= 0 ? 'text-profit' : 'text-loss'}>
                {formatPnL(partnerComparison.t1.net)}
              </b>
            </div>
            <p>
              {partnerComparison.t1.trades} صفقة · {partnerComparison.t1.rate}%
            </p>
          </article>
          <article className="ma-pair-card">
            <div className="ma-pair-top">
              <span className="ma-dot is-partner" />
              <h4>الشريك</h4>
              <b className={partnerComparison.t2.net >= 0 ? 'text-profit' : 'text-loss'}>
                {formatPnL(partnerComparison.t2.net)}
              </b>
            </div>
            <p>
              {partnerComparison.t2.trades} صفقة · {partnerComparison.t2.rate}%
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="mn-section-head">
          <h3>أيام الأسبوع</h3>
        </div>
        <div className="ma-dow">
          {dayOfWeekData.map((d) => (
            <div key={d.day} className="ma-dow-cell">
              <span>{d.day.slice(0, 2)}</span>
              <strong className={d.pnl >= 0 ? 'text-profit' : 'text-loss'}>
                {formatPnL(d.pnl, { compact: true, compactFrom: 1000 })}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mn-section-head">
          <h3>حسب الفئة</h3>
        </div>
        <div className="mn-list">
          {topCats.length === 0 ? (
            <p className="ma-muted">ما كاينش بيانات</p>
          ) : (
            topCats.map((cat) => (
              <article key={cat.name} className="mn-row">
                <div className="mn-row-main ma-cat">
                  <div>
                    <h4>{cat.name}</h4>
                    <p>
                      {cat.trades} صفقة · {cat.winRate}%
                    </p>
                  </div>
                  <strong className={cat.pnl >= 0 ? 'text-profit' : 'text-loss'}>{formatPnL(cat.pnl)}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
