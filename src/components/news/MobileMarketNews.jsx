import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bell, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { ECONOMIC_EVENTS, MARKET_NEWS } from '../../data/newsData';
import { useAppStore } from '../../store/useAppStore';
import BotSafetyRadar from '../ui/BotSafetyRadar';

const GOLD_SESSION = [
  { t: '08:00', p: 2712 },
  { t: '09:00', p: 2718 },
  { t: '10:00', p: 2726 },
  { t: '11:00', p: 2731 },
  { t: '12:00', p: 2722 },
  { t: '13:00', p: 2738 },
  { t: '14:00', p: 2744 },
  { t: '15:00', p: 2734.5 },
];

function getVolatility(event) {
  if (event.impact === 'HIGH') {
    const explosive = ['CPI', 'FOMC', 'NFP', 'ECB'];
    if (explosive.some((k) => event.event.includes(k))) {
      return { darija: 'حركة قوية بزاف', warning: 'حبس البوت' };
    }
    return { darija: 'حركة قوية', warning: 'نقص اللوت' };
  }
  return { darija: 'حركة متوسطة', warning: 'راقب' };
}

function GoldMiniChart() {
  return (
    <section className="mn-chart-card">
      <div className="mn-chart-head">
        <div className="min-w-0">
          <p className="mn-kicker">XAU / USD</p>
          <p className="mn-chart-price" dir="ltr">
            $2,734.50 <span>+0.85%</span>
          </p>
        </div>
        <div className="mn-levels">
          <span className="is-res">R 2755</span>
          <span className="is-sup">S 2695</span>
        </div>
      </div>

      <div className="mn-chart" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={GOLD_SESSION} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mnGoldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3dffb0" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3dffb0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="t"
              stroke="rgba(255,255,255,0.28)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickMargin={4}
            />
            <YAxis hide domain={[2690, 2760]} />
            <Tooltip
              cursor={{ stroke: 'rgba(61,255,176,0.28)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="mn-tip">
                    {payload[0].payload.t} · ${payload[0].value}
                  </div>
                );
              }}
            />
            <ReferenceLine y={2755} stroke="#ff7a93" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={2725} stroke="#7dd3fc" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={2695} stroke="#3dffb0" strokeDasharray="4 4" strokeWidth={1} />
            <Area type="monotone" dataKey="p" stroke="#3dffb0" strokeWidth={2} fill="url(#mnGoldFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function MobileMarketNews() {
  const [panel, setPanel] = useState('calendar');
  const [calendarFilter, setCalendarFilter] = useState('TODAY');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openId, setOpenId] = useState(null);
  const [lang, setLang] = useState('darija');
  const [sharedToast, setSharedToast] = useState(null);

  const addNotification = useAppStore((s) => s.addNotification);
  const traders = useAppStore((s) => s.traders);
  const activeTraderId = useAppStore((s) => s.activeTraderId);
  const currentTraderObj = traders.find((t) => t.id === activeTraderId) || traders[0];
  const partnerTraderObj = traders.find((t) => t.id !== activeTraderId) || traders[1];
  const isAr = lang === 'darija';

  const filteredCalendar = useMemo(() => {
    if (calendarFilter === 'HIGH') return ECONOMIC_EVENTS.filter((e) => e.impact === 'HIGH');
    if (calendarFilter === 'TODAY') return ECONOMIC_EVENTS.filter((e) => e.date === 'Today');
    return ECONOMIC_EVENTS;
  }, [calendarFilter]);

  const filteredNews = useMemo(() => {
    if (activeCategory === 'ALL') return MARKET_NEWS;
    if (activeCategory === 'XAUUSD') return MARKET_NEWS.filter((n) => n.market === 'XAUUSD');
    return MARKET_NEWS.filter((n) => n.category.toLowerCase().includes(activeCategory.toLowerCase()));
  }, [activeCategory]);

  const handleShareWithPartner = (item) => {
    addNotification({
      title: `تنبيه ${item.market || item.currency} من ${currentTraderObj.name}`,
      body: item.summaryAr || item.summary || item.eventAr || item.event,
      tag: item.market || item.currency,
      highImpact: item.impact === 'HIGH' || item.sentiment === 'VOLATILE' || item.market === 'XAUUSD',
    });
    setSharedToast(`تم الإرسال لـ ${partnerTraderObj.name}`);
    setTimeout(() => setSharedToast(null), 2800);
  };

  return (
    <div className="news-rtl mn-stack">
      <BotSafetyRadar compact />

      {sharedToast && <div className="mn-toast">{sharedToast}</div>}

      <div className="mj-stats mn-ticker-stats">
        <div className="mj-stat">
          <span>GOLD</span>
          <strong dir="ltr">
            2734.5 <em className="mn-delta text-profit">+0.85%</em>
          </strong>
        </div>
        <div className="mj-stat">
          <span>DXY</span>
          <strong dir="ltr">
            103.18 <em className="mn-delta text-rose-400">-0.24%</em>
          </strong>
        </div>
        <button type="button" onClick={() => setLang(isAr ? 'en' : 'darija')} className="mj-stat mn-lang-stat">
          <span>LANG</span>
          <strong>{isAr ? 'EN' : 'AR'}</strong>
        </button>
      </div>

      <GoldMiniChart />

      <div className="mj-range mj-range-2" role="tablist" aria-label="القسم">
        <button
          type="button"
          role="tab"
          aria-selected={panel === 'calendar'}
          onClick={() => setPanel('calendar')}
          className={`mj-range-item ${panel === 'calendar' ? 'mj-range-item-active' : ''}`}
        >
          التقويم
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={panel === 'news'}
          onClick={() => setPanel('news')}
          className={`mj-range-item ${panel === 'news' ? 'mj-range-item-active' : ''}`}
        >
          الأخبار
        </button>
      </div>

      {panel === 'calendar' ? (
        <section>
          <div className="mn-chips" role="tablist">
            {[
              { id: 'TODAY', label: 'اليوم' },
              { id: 'HIGH', label: 'قوي' },
              { id: 'ALL', label: 'الكل' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCalendarFilter(tab.id)}
                className={`mn-chip ${calendarFilter === tab.id ? 'mn-chip-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mn-list">
            {filteredCalendar.map((ev) => {
              const open = openId === ev.id;
              const volatility = getVolatility(ev);
              const high = ev.impact === 'HIGH';
              return (
                <article key={ev.id} className={`mn-row ${high ? 'is-high' : ''} ${open ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="mn-row-main"
                    onClick={() => setOpenId(open ? null : ev.id)}
                  >
                    <div className="mn-row-meta">
                      <span className="mn-time" dir="ltr">
                        {ev.time.replace(' GMT', '')}
                      </span>
                      <span className="mn-ccy">{ev.currency}</span>
                      {high && <span className="mn-badge">{volatility.warning}</span>}
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    <h4>{isAr ? ev.eventAr || ev.event : ev.event}</h4>
                    <div className="mn-metrics">
                      <span>
                        المتوقع <b>{ev.forecast}</b>
                      </span>
                      <span>
                        السابق <b>{ev.previous}</b>
                      </span>
                    </div>
                  </button>

                  {open && (
                    <div className="mn-row-body">
                      {high && (
                        <p className="mn-note">
                          <Bell size={11} /> {volatility.darija} · الذهب {ev.dollarRange}
                        </p>
                      )}
                      <p>{isAr ? ev.darija?.meaning : ev.notes}</p>
                      {ev.darija?.bot && <p className="mn-bot-note">{ev.darija.bot}</p>}
                      <button type="button" onClick={() => handleShareWithPartner(ev)} className="mn-share">
                        <Share2 size={11} /> الشريك
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <div className="mn-chips">
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'XAUUSD', label: 'ذهب' },
              { id: 'Forex', label: 'فوركس' },
              { id: 'Indices', label: 'مؤشرات' },
              { id: 'Crypto', label: 'كريبتو' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`mn-chip ${activeCategory === tab.id ? 'mn-chip-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mn-list">
            {filteredNews.map((item) => {
              const open = openId === item.id;
              return (
                <article key={item.id} className={`mn-row ${open ? 'is-open' : ''}`}>
                  <button type="button" className="mn-row-main" onClick={() => setOpenId(open ? null : item.id)}>
                    <div className="mn-row-meta">
                      <span className="mn-ccy">{item.market}</span>
                      <span
                        className={`mn-sent ${
                          item.sentiment === 'BULLISH'
                            ? 'is-up'
                            : item.sentiment === 'VOLATILE'
                              ? 'is-hot'
                              : 'is-mid'
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    <h4>{isAr ? item.titleAr || item.title : item.title}</h4>
                  </button>
                  {open && (
                    <div className="mn-row-body">
                      <p>{isAr ? item.summaryAr || item.summary : item.summary}</p>
                      {item.technicalLevels && (
                        <div className="mn-tech">
                          <span>مقاومة {item.technicalLevels.resistance}</span>
                          <span>دعم {item.technicalLevels.support}</span>
                        </div>
                      )}
                      <button type="button" onClick={() => handleShareWithPartner(item)} className="mn-share">
                        <Share2 size={11} /> أخبر {partnerTraderObj.name}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
