import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Info,
  Languages,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Check,
} from 'lucide-react';
import { ECONOMIC_EVENTS, MARKET_NEWS } from '../../data/newsData';
import { useAppStore } from '../../store/useAppStore';
import { useIsPhone } from '../../hooks/useMediaQuery';
import BotSafetyRadar from '../ui/BotSafetyRadar';
import MobileMarketNews from './MobileMarketNews';

function getVolatility(event) {
  if (event.impact === 'HIGH') {
    const explosive = ['CPI', 'FOMC', 'NFP', 'ECB'];
    if (explosive.some((k) => event.event.includes(k))) {
      return {
        darija: 'حركة قوية بزاف (شمعة انفجارية)',
        warning: 'احبس البوت دابا',
      };
    }
    return { darija: 'حركة قوية', warning: 'نقص حجم اللوت' };
  }
  return { darija: 'حركة متوسطة', warning: 'راقب بحذر' };
}

export default function MarketNewsView() {
  const isPhone = useIsPhone();
  const [calendarFilter, setCalendarFilter] = useState('TODAY');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(ECONOMIC_EVENTS[0]);
  const [darijaOpen, setDarijaOpen] = useState(true);
  const [lang, setLang] = useState('darija');
  const [sharedToast, setSharedToast] = useState(null);

  const addNotification = useAppStore((s) => s.addNotification);
  const traders = useAppStore((s) => s.traders);
  const activeTraderId = useAppStore((s) => s.activeTraderId);
  const currentTraderObj = traders.find((t) => t.id === activeTraderId) || traders[0];
  const partnerTraderObj = traders.find((t) => t.id !== activeTraderId) || traders[1];

  const moroccoTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-MA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Africa/Casablanca',
      }).format(new Date());
    } catch {
      return '--:--';
    }
  }, []);

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
    setSharedToast(`تحذير الشريك: تم مشاركة التنبيه مع ${partnerTraderObj.name}`);
    setTimeout(() => setSharedToast(null), 3200);
  };

  const isAr = lang === 'darija';

  if (isPhone) return <MobileMarketNews />;

  return (
    <div className="news-rtl space-y-4">
      <BotSafetyRadar />

      {sharedToast && (
        <div className="flex items-center gap-2 rounded-xl border border-profit/40 bg-profit/15 px-4 py-2.5 text-xs font-bold text-profit">
          <Check size={15} />
          <span>{sharedToast}</span>
        </div>
      )}

      {/* Session / gold ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#101018]/80 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black text-ink-950">
                LIVE XAU/USD · مباشر
              </span>
              <span className="text-[11px] text-white/50">جلسة لندن / نيويورك المتداخلة</span>
            </div>
            <p className="mt-0.5 text-sm font-extrabold text-white">
              الذهب والعملات تحت تأثير تقلبات الأخبار الاقتصادية
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-left">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">GOLD SPOT (XAU/USD)</div>
            <div className="text-sm font-black tabular text-white">
              $2,734.50 <span className="text-[11px] text-profit">+0.85%</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-left">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">US DOLLAR (DXY)</div>
            <div className="text-sm font-black tabular text-white">
              103.18 <span className="text-[11px] text-rose-400">-0.24%</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/80">
            🇲🇦 دارجة مغربية
            <span className="mr-2 text-white/40">{moroccoTime}</span>
          </div>
          <button
            type="button"
            onClick={() => setLang(isAr ? 'en' : 'darija')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] font-bold text-white/80 hover:bg-black/55"
          >
            <Languages size={13} />
            {isAr ? 'English' : 'الدارجة'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <section className="space-y-3 rounded-[22px] border border-white/8 bg-[#0e0e16]/80 p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-sky-300" />
              <h3 className="text-sm font-extrabold text-white">
                التقويم الاقتصادي: شرح الأخبار وحركة الشارت وتنبيهات البوت
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'TODAY', label: 'اليوم (Today)' },
                { id: 'HIGH', label: 'أخبار قوية (حبس البوت)', dot: true },
                { id: 'ALL', label: 'جميع الأخبار' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCalendarFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    calendarFilter === tab.id
                      ? 'bg-white/10 text-white ring-1 ring-white/15'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {tab.dot && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCalendar.map((ev) => {
              const open = selectedEvent?.id === ev.id;
              const volatility = getVolatility(ev);
              const high = ev.impact === 'HIGH';
              return (
                <article
                  key={ev.id}
                  className={`rounded-2xl border p-4 transition ${
                    open
                      ? 'border-rose-400/35 bg-gradient-to-b from-[#241018] to-[#141018]'
                      : high
                        ? 'border-rose-500/20 bg-[#161018] hover:border-rose-500/35'
                        : 'border-white/8 bg-[#12121a] hover:border-white/15'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {high && (
                        <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white">
                          {volatility.warning}
                        </span>
                      )}
                      <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-black text-white/80">
                        {ev.currency}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/45">
                        <Clock size={12} /> {ev.time} ({ev.date})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/55">
                      <span>
                        المتوقع: <b className="text-white">{ev.forecast}</b>
                      </span>
                      <span>
                        السابق: <b className="text-white/80">{ev.previous}</b>
                      </span>
                      {ev.actual && (
                        <span>
                          الفعلي: <b className="text-profit">{ev.actual}</b>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-[15px] font-black text-white">
                        {isAr ? ev.eventAr || ev.event : ev.event}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-white/40">{ev.event}</p>
                    </div>
                    {high && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                        <Bell size={11} /> إنذار قبل 30 دقيقة
                      </span>
                    )}
                  </div>

                  {high && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5">
                      <div className="text-[12px] leading-6 text-white/80">
                        <div className="font-bold text-white">{isAr ? ev.darija?.expected : ev.notes}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-rose-600/80 px-2 py-0.5 text-[10px] font-black text-white">
                            {volatility.darija}
                          </span>
                          <span className="text-[11px] font-bold text-amber-200">
                            على الذهب {ev.dollarRange} / {ev.pipRange}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(open ? null : ev);
                        setDarijaOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-sky-300 hover:text-sky-200"
                    >
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {open ? 'إخفاء الشرح بالدارجة' : 'عرض الشرح بالدارجة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWithPartner(ev)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-400/10 px-2.5 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-400/15"
                    >
                      <Share2 size={12} /> تحذير الشريك (Partner Alert)
                    </button>
                  </div>

                  {open && darijaOpen && (
                    <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <h5 className="mb-1.5 flex items-center gap-2 text-[12px] font-black text-sky-300">
                          <Info size={14} /> أشنو كيعني هاد الخبر بالدارجة؟
                        </h5>
                        <p className="text-[12px] leading-7 text-white/70">
                          {isAr ? ev.darija?.meaning : ev.notes}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <h5 className="mb-1.5 flex items-center gap-2 text-[12px] font-black text-sky-300">
                          <TrendingUp size={14} /> كيفاش كيحرك الشارت والذهب (XAUUSD)؟
                        </h5>
                        <p className="text-[12px] leading-7 text-white/70">{ev.darija?.chart}</p>
                      </div>
                      <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                        <h5 className="mb-1.5 flex items-center gap-2 text-[12px] font-black text-rose-300">
                          <AlertTriangle size={14} /> علاش قبل الخبر بـ 30 دقيقة لازم تحبس البوت؟
                        </h5>
                        <p className="text-[12px] leading-7 text-white/75">{ev.darija?.bot}</p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <h5 className="mb-1.5 flex items-center gap-2 text-[12px] font-black text-sky-300">
                          <Users size={14} /> نصيحة المتداولين الثنائي
                        </h5>
                        <p className="text-[12px] leading-7 text-white/70">{ev.darija?.partner}</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Gold analysis */}
        <aside className="space-y-3 rounded-[22px] border border-white/8 bg-[#0e0e16]/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              <h3 className="text-sm font-extrabold text-white">تحليل الذهب (XAU/USD) اليوم</h3>
            </div>
            <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black text-ink-950">Gold Master</span>
          </div>

          <div className="rounded-xl border border-white/8 bg-black/30 p-3">
            <div className="mb-2 text-[11px] font-bold text-white/70">مستويات الدعم والمقاومة اليوم (TECHNICAL LEVELS)</div>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-white/50">منطقة المقاومة القوية:</span>
                <span className="font-black tabular text-rose-300">$2,748 - $2,755</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">النقطة المحورية (Pivot):</span>
                <span className="font-black tabular text-sky-300">$2,725.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">منطقة الطلب والدعم اليومي:</span>
                <span className="font-black tabular text-profit">$2,708 - $2,695</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-400/30 bg-amber-400/8 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-amber-300">
              <AlertTriangle size={14} /> بروتوكول حماية البوت قبل 30 دقيقة
            </div>
            <ul className="space-y-2 text-[12px] leading-6 text-white/75">
              <li>
                CPI / FOMC: حبس البوت قبل 30 دقيقة؛ مستوع خليها تخدم ونتا باغي منتفخوش عبر الارتزاق (Limit Orders) إلغاء
                الأوامر المعلقة.
              </li>
              <li>
                الرجوع بعد 15 دقيقة: ماتشغلش البوت حتى تتقلق الشمعة الأولى ديال 15 دقيقة بعد الخبر.
              </li>
              <li>
                خليوكم جوج: Trader 1 و Trader 2 للتنسيق بين الشريكين. الحسابات محمية.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-sky-400/25 bg-sky-500/8 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-sky-300">
              <Compass size={14} /> حيل حماية الروبوتات بالدارجة
            </div>
            <p className="text-[12px] font-bold text-sky-200">قاعدة الـ 30 دقيقة الذهبية</p>
            <p className="mt-1 text-[12px] leading-6 text-white/70">
              حبس الروبوت قبل 30 دقيقة من CPI أو FOMC، وأعيد تشغيله بعد 15 دقيقة من إغلاق شمعة 15 دقيقة. ما تدخلش أمر
              معلّق أثناء الخبر حتى لو الاتجاه باين واعد.
            </p>
          </div>
        </aside>
      </div>

      {/* News feed */}
      <section className="rounded-[22px] border border-white/8 bg-[#0e0e16]/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white">موجات السوق المباشرة والإشارات</h3>
            <p className="text-[11px] text-white/45">أخبار عاجلة عبر السلع، الفوركس، العملات الرقمية والمؤشرات</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'كاع الأصول' },
              { id: 'XAUUSD', label: 'الذهب' },
              { id: 'Forex', label: 'الفوركس' },
              { id: 'Indices', label: 'المؤشرات' },
              { id: 'Crypto', label: 'الكريبتو' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  activeCategory === tab.id ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredNews.map((item) => (
            <article key={item.id} className="flex flex-col rounded-2xl border border-white/8 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-black text-white/70">
                    {item.market}
                  </span>
                  <span className="text-[11px] text-white/40">{item.time}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    item.sentiment === 'BULLISH'
                      ? 'bg-profit/15 text-profit'
                      : item.sentiment === 'VOLATILE'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-sky-500/15 text-sky-300'
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold leading-6 text-white">
                {isAr ? item.titleAr || item.title : item.title}
              </h4>
              <p className="mt-2 flex-1 text-[12px] leading-6 text-white/60">
                {isAr ? item.summaryAr || item.summary : item.summary}
              </p>
              {item.technicalLevels && (
                <div className="mt-3 space-y-1 rounded-xl border border-white/8 bg-black/30 p-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">المقاومة</span>
                    <span className="font-bold text-rose-300">{item.technicalLevels.resistance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">الدعم</span>
                    <span className="font-bold text-profit">{item.technicalLevels.support}</span>
                  </div>
                </div>
              )}
              <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-500/8 p-3 text-[11px] text-sky-200">
                <strong>نصيحة:</strong> {isAr ? item.actionableTipAr || item.actionableTip : item.actionableTip}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3 text-[11px] text-white/40">
                <span>{item.impact}</span>
                <button
                  type="button"
                  onClick={() => handleShareWithPartner(item)}
                  className="inline-flex items-center gap-1 font-bold text-sky-300"
                >
                  <Share2 size={12} /> أخبر {partnerTraderObj.name}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
