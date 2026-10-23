import { useState, useEffect, useRef } from 'react';
import { Bell, Pause, Play, Shield, AlertTriangle } from 'lucide-react';
import { ECONOMIC_EVENTS } from '../../data/newsData';
import { getUpcomingEvents } from '../../lib/economicCalendarAPI';
import { generateRadarData } from '../../lib/botSafetyRadar';

export default function BotSafetyRadar({ compact = false }) {
  const [radarData, setRadarData] = useState(null);
  const [botPaused, setBotPaused] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [economicEvents, setEconomicEvents] = useState(ECONOMIC_EVENTS);
  const [radarOpen, setRadarOpen] = useState(false);
  const seededRef = useRef(false);

  const createTestEvent = () => {
    const now = new Date();
    const testTime = new Date(now.getTime() + 28 * 60 * 1000 + 23 * 1000);
    const hours = testTime.getUTCHours();
    const minutes = testTime.getUTCMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const dateStr = testTime.toISOString().split('T')[0];

    const testEvent = {
      id: 'test-cpi',
      time: timeStr,
      date: dateStr,
      currency: 'USD',
      impact: 'HIGH',
      event: 'US Core CPI (Consumer Price Index) MoM',
      forecast: '0.3%',
      previous: '0.3%',
      actual: null,
      affectedAssets: ['XAUUSD'],
      notes: 'Softer CPI weakens US Dollar, triggering strong bullish momentum in Gold (XAUUSD).',
      utcTime: testTime,
    };

    setEconomicEvents([testEvent]);
    setIsTestMode(true);
    setBotPaused(true);
  };

  const fetchEvents = async () => {
    if (isTestMode) return;
    try {
      const events = await getUpcomingEvents({
        countries: 'US,EU,GB',
        impact: 'high,medium',
        limit: 20,
      });

      if (!isTestMode && events.length > 0) {
        setEconomicEvents(events);
      }
    } catch (error) {
      console.error('Failed to fetch economic events:', error);
    }
  };

  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true;
      createTestEvent();
    }
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateRadar = () => {
      try {
        const data = generateRadarData(economicEvents);
        setRadarData(data);
      } catch (error) {
        console.error('Error generating radar data:', error);
      }
    };

    updateRadar();
    const interval = setInterval(updateRadar, 1000);
    return () => clearInterval(interval);
  }, [economicEvents]);

  const toggleBot = () => {
    setBotPaused(!botPaused);
  };

  const exitTestMode = () => {
    setIsTestMode(false);
    setEconomicEvents(ECONOMIC_EVENTS);
  };

  if (!radarData) {
    return (
      <div className={compact ? 'news-rtl mn-radar' : 'news-rtl rounded-2xl border border-[#ff4d73]/40 bg-[#14121c] px-4 py-3'}>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <span className="news-live-dot" />
          <span>جاري تحميل الرادار...</span>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(radarData.remaining_seconds / 60);
  const seconds = radarData.remaining_seconds % 60;
  const clock = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isDanger = radarData.status === 'DANGER';
  const isVolatile = radarData.status === 'VOLATILE';
  const isAlert = isDanger || isVolatile;

  const bannerTone = isDanger
    ? 'border-[#e11d48]/80'
    : isVolatile
      ? 'border-amber-400/70'
      : 'border-emerald-400/40';

  if (compact) {
    const radarClass = isDanger ? '' : isVolatile ? 'is-volatile' : 'is-safe';
    return (
      <div className="news-rtl">
        <div className={`mn-radar ${radarClass}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`news-live-dot ${isAlert ? '' : 'news-live-dot--safe'}`} />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-extrabold leading-5 text-white">
                  {isDanger && 'إنذار 30 د · حبس البوت'}
                  {isVolatile && 'الخبر صدر · خلّي البوت واقف'}
                  {!isAlert && 'الوضع آمن'}
                </p>
                <p className="text-[10px] font-bold tabular text-white/45">
                  {isAlert ? (
                    <span dir="ltr">
                      {clock} · CPI / XAUUSD
                    </span>
                  ) : (
                    'ما كاينش خبر قوي قريب'
                  )}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setRadarOpen((open) => !open)} className="mn-radar-cta">
              {radarOpen ? 'إخفاء' : 'الرادار'}
            </button>
          </div>

          {radarOpen && (
            <div className="mt-2 space-y-2 border-t border-white/8 pt-2">
              <p className="text-[11px] leading-5 text-white/70">
                {isDanger
                  ? 'شمعة قوية متوقعة على الذهب. حبس البوت دابا حتى يستقر السبريد.'
                  : isVolatile
                    ? 'خلّي البوت واقف حتى تتقلق شمعة 15 دقيقة.'
                    : 'الروبوتات تقدرو يخدمو بشكل عادي.'}
              </p>
              <button
                type="button"
                onClick={toggleBot}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-extrabold ${
                  botPaused ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                <span>{botPaused ? 'البوت متوقف' : 'البوت كيخدم'}</span>
                {botPaused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="news-rtl space-y-3">
      <div className={`news-alert-banner ${bannerTone}`}>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 w-full flex-1 items-start gap-2.5 sm:order-2 sm:w-auto sm:flex-row-reverse sm:items-center">
            <span className={`news-live-dot mt-[7px] sm:mt-0 ${isAlert ? '' : 'news-live-dot--safe'}`} />
            <p className="min-w-0 text-[13px] font-semibold leading-7 text-white/92 sm:text-[14px]">
              {isDanger && (
                <>
                  <span className="font-black text-white">إنذار 30 دقيقة:</span>{' '}
                  <span className="font-black text-white">حبس البوت دابا!</span>{' '}
                  باقي <span className="font-black tabular text-white">{minutes}</span> دقيقة على خبر{' '}
                  <span className="font-black text-white">CPI</span> والفائدة. شمعة انفجارية متوقعة وسبريد عريض على الذهب{' '}
                  <span className="font-black text-white">(XAUUSD)</span>.
                </>
              )}
              {isVolatile && (
                <>
                  <span className="font-black text-amber-200">الخبر صدر دابا!</span> خلّي البوت واقف حتى تستقر الشمعة والسبريد على الذهب{' '}
                  <span className="font-black text-white">(XAUUSD)</span>.
                </>
              )}
              {!isAlert && (
                <>
                  <span className="font-black text-emerald-300">الوضع آمن.</span> ما كاينش خبر قوي قريب، والروبوتات تقدرو يخدمو بشكل عادي على الذهب{' '}
                  <span className="font-black text-white">(XAUUSD)</span>.
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRadarOpen((open) => !open)}
            className="news-alert-cta sm:order-1 sm:shrink-0"
          >
            {radarOpen ? 'إخفاء رادار الأخبار والبوت' : 'فتح رادار الأخبار والبوت'}
          </button>
        </div>
      </div>

      {radarOpen && (
        <div
          className={`relative overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 transition-all duration-300 ${
            isDanger
              ? 'border-[#ff4d73]/70 bg-gradient-to-l from-[#3a0d18] via-[#1a0b12] to-[#12080c] shadow-[0_0_40px_-12px_rgba(255,45,85,0.55)]'
              : isVolatile
                ? 'border-warn/60 bg-gradient-to-l from-warn/15 via-[#1a1208] to-[#120e08]'
                : 'border-profit/40 bg-gradient-to-l from-profit/10 via-[#08140f] to-[#080c0a]'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,45,85,0.18),transparent_55%)]" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] font-bold text-rose-200">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-rose-500/20 text-rose-300">⏱</span>
                  رادار الإنذار المبكر: 30 دقيقة قبل صدور الأخبار
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_10px_#ff2d55]" />
                  LIVE 30M RADAR
                </span>
              </div>

              <h2 className="text-[18px] font-black leading-snug sm:text-[22px]">
                {isDanger && (
                  <span>
                    إنذار مبكر: باقي <span className="tabular text-[#ff4d73]">{clock}</span> على خبر التضخم والفائدة{' '}
                    <span className="text-white">(CPI / FOMC)!</span>
                  </span>
                )}
                {isVolatile && (
                  <span className="text-warn">الخبر صدر دابا! خلّي البوت واقف حتى تستقر الشمعة</span>
                )}
                {!isAlert && <span className="text-profit">الوضع آمن — ما كاينش خبر قوي قريب</span>}
              </h2>

              <p className="mt-2 max-w-3xl text-[13px] leading-7 text-white/75">
                شمعة انفجارية متوقعة ديال <span className="font-extrabold text-white">100 - 180 نقطة</span> على الذهب
                (XAUUSD). <span className="font-extrabold text-rose-300">حبس البوت دابا!</span> السوق غادي يتحرك بطريقة
                عنيفة بزاف، السبريد غادي يوسع وكيقدر يمرجن حسابات الروبوتات فثواني.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[280px]">
              <button
                type="button"
                onClick={toggleBot}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-right transition ${
                  botPaused
                    ? 'border-emerald-400/40 bg-gradient-to-l from-emerald-500/20 to-emerald-500/5'
                    : 'border-rose-400/50 bg-gradient-to-l from-rose-500/20 to-rose-500/5'
                }`}
              >
                <div>
                  <div className={`text-sm font-black ${botPaused ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {botPaused ? 'البوت متوقف (وضع الأمان مفعل)' : 'البوت كيخدم — خطر الشموع'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/60">
                    {botPaused ? 'محمي من الشموع الانفجارية' : 'حبس البوت قبل الخبر'}
                  </div>
                </div>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full ${
                    botPaused ? 'bg-emerald-400 text-ink-950' : 'bg-rose-500 text-white'
                  }`}
                >
                  {botPaused ? <Shield size={15} /> : <AlertTriangle size={15} />}
                </span>
              </button>

              <button
                type="button"
                onClick={isTestMode ? exitTestMode : createTestEvent}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-4 py-2.5 text-[12px] font-bold text-white/85 hover:bg-black/60"
              >
                <Bell size={14} className="text-amber-300" />
                {isTestMode ? 'إنهاء اختبار التنبيه' : 'جرب تنبيه 30 دقيقة قبل الخبر'}
              </button>

              <button
                type="button"
                onClick={toggleBot}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-[11px] font-black ${
                  botPaused ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500 text-white'
                }`}
              >
                {botPaused ? <Play size={13} /> : <Pause size={13} />}
                {botPaused ? 'تشغيل البوت بعد الاستقرار' : 'إيقاف البوت دابا'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
