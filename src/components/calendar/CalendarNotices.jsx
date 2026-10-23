import { AlertTriangle, Plus, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function CalendarNotices() {
  const isEmpty = useAppStore((s) => s.transactions.length === 0);
  const storageError = useAppStore((s) => s.storageError);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const setActiveNav = useAppStore((s) => s.setActiveNav);
  const clearSyncError = useAppStore((s) => s.clearSyncError);
  const notificationSettings = useAppStore((s) => s.notificationSettings);
  const clearSnooze = useAppStore((s) => s.clearSnooze);
  const isSnoozed = notificationSettings?.snoozeUntil && notificationSettings.snoozeUntil > Date.now();
  const isSilent = notificationSettings?.silentMode;
  const minutesRemaining = isSnoozed ? Math.max(1, Math.ceil((notificationSettings.snoozeUntil - Date.now()) / 60000)) : 0;

  const failures = (isSnoozed || isSilent) ? [] : Object.entries(syncStatus).filter(([, st]) => st?.auto && !st.ok);

  return (
    <>
      {isSnoozed && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-warn/30 bg-warn/10 backdrop-blur-2xl px-4 py-2.5 text-xs text-warn">
          <div className="flex items-center gap-2">
            <span>🔕</span>
            <span>الإشعارات مكتومة: الحماية من الرسائل المزعجة نشطة لـ <strong>{minutesRemaining} دقيقة</strong>.</span>
          </div>
          <button
            type="button"
            onClick={clearSnooze}
            className="text-xs font-bold text-profit hover:underline ml-2"
          >
            فك الكتم
          </button>
        </div>
      )}
      {storageError && !isSnoozed && (
        <div role="alert" className="mb-3 flex items-center gap-3 rounded-xl border border-loss/40 bg-loss/15 backdrop-blur-2xl px-4 py-2.5 text-xs text-fg">
          <AlertTriangle size={16} className="shrink-0 text-loss" />
          آخر تغيير ماتقدرش يتخزن: التخزين المحلي ممتلئ. احذف بعض الصور لتحرير المساحة.
        </div>
      )}
      {failures.map(([service, st]) => (
        <div key={service} role="alert" className="mb-3 flex items-center gap-3 rounded-xl border border-loss/40 bg-loss/15 backdrop-blur-2xl px-4 py-2.5 text-xs text-fg">
          <AlertTriangle size={16} className="shrink-0 text-loss" />
          <span className="min-w-0 flex-1 truncate">
            {service === 'discord' ? 'Discord' : 'Google Sheets'} فشل المزامنة: {st.error}
          </span>
          <button type="button" onClick={() => setActiveNav('settings')} className="btn-ghost h-7 px-2 text-2xs text-profit">
            فتح الإعدادات
          </button>
          <button type="button" aria-label="Dismiss" onClick={() => clearSyncError(service)} className="btn-icon h-7 w-7">
            <X size={13} />
          </button>
        </div>
      ))}
      {isEmpty && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-profit/25 bg-profit/5 backdrop-blur-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-profit/10 text-profit ring-1 ring-profit/25">
              <Sparkles size={17} />
            </div>
            <div>
              <p className="text-sm font-bold">دفترك فارغ</p>
              <p className="text-xs text-fg-muted">دوس على أي يوم، أو استخدم + إضافة صفقة، لتسجيل أول صفقة.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveNav('export')}
              className="group inline-flex items-center gap-2 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 px-4 py-2.5 text-xs font-bold text-fg shadow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250"
            >
              <Sparkles size={16} className="text-profit group-hover:rotate-12 transition-transform duration-250" /> تحميل صفقات تجريبية
            </button>
            <button
              type="button"
              onClick={() => openAddTransaction()}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-4 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30"
            >
              <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-250" /> إضافة أول صفقة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
