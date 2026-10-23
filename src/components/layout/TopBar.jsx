import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  Bell,
  BellOff,
  Check,
  ChevronDown,
  Clock,
  Filter,
  Flame,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppStore, VIEW_RANGES } from '../../store/useAppStore';

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
    const esc = (e) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [ref, onOutside]);
}

/**
 * 2-Trader Duo Partner and Account Switcher
 */
function DuoAccountSelector() {
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const setSelectedAccount = useAppStore((s) => s.setSelectedAccount);
  const traders = useAppStore((s) => s.traders);
  const selectedTraderId = useAppStore((s) => s.selectedTraderId);
  const setSelectedTraderId = useAppStore((s) => s.setSelectedTraderId);
  const activeTraderId = useAppStore((s) => s.activeTraderId);
  const setActiveTraderId = useAppStore((s) => s.setActiveTraderId);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? accounts[0];
  const selectedTrader = traders.find((t) => t.id === selectedTraderId);

  const isShared = selectedTraderId === 'all';

  return (
    <div ref={ref} className="no-drag relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'inline-flex items-center flex-nowrap gap-2.5 h-9 pl-2.5 pr-2.5 rounded-lg border border-line bg-surface hover:bg-surface-hover text-fg text-xs font-medium transition-all duration-150 cursor-pointer shrink-0',
          open ? 'border-accent bg-surface-hover shadow-glow-accent ring-1 ring-accent/30' : 'hover:border-line-strong'
        )}
      >
        {/* Trader Avatar / Icon badge */}
        <div className="flex items-center -space-x-1 shrink-0">
          {isShared ? (
            <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-tr from-emerald-500 to-cyan-500 text-[10px] font-bold text-ink-950 shadow-sm">
              <Users size={12} />
            </div>
          ) : (
            <div
              className="grid h-5 w-5 place-items-center rounded-md text-[10px] font-extrabold text-ink-950 shadow-sm"
              style={{ backgroundColor: selectedTrader?.color || '#06B6D4' }}
            >
              {selectedTrader?.avatar || 'T'}
            </div>
          )}
        </div>

        <div className="flex flex-col text-left leading-none max-w-[9.5rem] truncate">
          <span className="text-xs font-semibold text-fg truncate">
            {isShared ? 'كاع المتداولين' : selectedTrader?.name?.split(' ')[0] || 'متداول'}
          </span>
          <span className="text-[10px] text-fg-subtle truncate">
            {selectedAccount?.name}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={clsx('text-fg-subtle transition-transform duration-200 ml-0.5', open && 'rotate-180 text-accent')}
        />
      </button>

      {open && (
        <div role="listbox" className="menu right-0 w-80 divide-y divide-white/8">
          {/* Section 1: Duo Trader Scope */}
          <div className="p-2 space-y-1">
            <p className="px-2 pb-1 text-2xs font-semibold uppercase tracking-wider text-fg-muted flex items-center justify-between">
              <span>عرض الصفقات حسب</span>
              <span className="badge badge-accent text-[9px]">شريكين</span>
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedTraderId('all');
                setOpen(false);
              }}
              className={clsx(
                'menu-item justify-between',
                selectedTraderId === 'all' && 'bg-surface-hover text-fg font-semibold'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-ink-950">
                  <Users size={13} />
                </div>
                <div className="text-left">
                  <span className="block text-xs">مشترك (كاع المتداولين)</span>
                  <span className="block text-[10px] text-fg-subtle">دفتر الشراكة المجمّع</span>
                </div>
              </div>
              {selectedTraderId === 'all' && <Check size={14} className="text-accent" />}
            </button>

            {traders.map((trader) => {
              const active = selectedTraderId === trader.id;
              return (
                <button
                  key={trader.id}
                  type="button"
                  onClick={() => {
                    setSelectedTraderId(trader.id);
                    setOpen(false);
                  }}
                  className={clsx('menu-item justify-between', active && 'bg-surface-hover text-fg font-semibold')}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-ink-950"
                      style={{ backgroundColor: trader.color }}
                    >
                      {trader.avatar}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs">{trader.name}</span>
                      <span className="block text-[10px] text-fg-subtle">{trader.role}</span>
                    </div>
                  </div>
                  {active && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>

          {/* Section 2: Account Filter */}
          <div className="p-2 space-y-1">
            <p className="px-2 pb-1 text-2xs font-semibold uppercase tracking-wider text-fg-muted">
              فلتر حساب التداول
            </p>
            {accounts.map((acc) => {
              const active = acc.id === selectedAccountId;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccount(acc.id);
                    setOpen(false);
                  }}
                  className={clsx('menu-item justify-between', active && 'bg-surface-hover text-fg font-semibold')}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: acc.color }} />
                    <span className="text-xs truncate">{acc.name}</span>
                  </div>
                  {active && <Check size={14} className="text-accent" />}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                useAppStore.getState().setActiveNav('accounts');
                setOpen(false);
              }}
              className="menu-item text-accent hover:text-accent-bright text-xs pt-1.5"
            >
              <Plus size={14} /> إدارة الحسابات
            </button>
          </div>

          {/* Section 3: Active Logger Toggle */}
          <div className="p-2.5 bg-black/20 backdrop-blur-xl rounded-b-xl flex items-center justify-between text-2xs">
            <span className="text-fg-subtle">المسجل الافتراضي:</span>
            <div className="flex items-center gap-1">
              {traders.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTraderId(t.id)}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                    activeTraderId === t.id ? 'bg-black/40 text-fg ring-1 ring-accent/40 font-bold' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {t.avatar}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Notification Center with Anti-Spam & 30-Minute Snooze Control
 */
function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const notifications = useAppStore((s) => s.notifications);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const notificationSettings = useAppStore((s) => s.notificationSettings);
  const snoozeNotifications = useAppStore((s) => s.snoozeNotifications);
  const clearSnooze = useAppStore((s) => s.clearSnooze);
  const toggleSilentMode = useAppStore((s) => s.toggleSilentMode);

  // Calculate remaining snooze minutes
  const isSnoozed = notificationSettings?.snoozeUntil && notificationSettings.snoozeUntil > Date.now();
  const minutesRemaining = isSnoozed ? Math.max(1, Math.ceil((notificationSettings.snoozeUntil - Date.now()) / 60000)) : 0;
  const isSilent = notificationSettings?.silentMode;

  const hasUnread = notifications.some((n) => n.unread) && !isSnoozed && !isSilent;

  return (
    <div ref={ref} className="no-drag relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notification Center"
        className={clsx(
          'btn-icon relative transition-colors',
          isSnoozed || isSilent ? 'text-fg-subtle hover:text-fg' : 'text-fg-muted hover:text-fg',
          open && 'bg-surface-hover text-fg'
        )}
      >
        {isSnoozed || isSilent ? <BellOff size={17} /> : <Bell size={17} />}
        {hasUnread && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent shadow-glow-accent animate-pulse" />
        )}
        {isSnoozed && (
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-warn text-[8px] font-bold px-1 text-ink-950">
            {minutesRemaining}m
          </span>
        )}
      </button>

      {open && (
        <div className="menu right-0 w-88 p-0 divide-y divide-white/8 shadow-2xl">
          {/* Header */}
          <div className="p-3.5 flex items-center justify-between bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              {isSnoozed ? (
                <BellOff size={16} className="text-warn" />
              ) : (
                <Bell size={16} className="text-accent" />
              )}
              <h4 className="text-xs font-bold text-fg">الإشعارات وتنبيهات السوق</h4>
            </div>

            {isSnoozed ? (
              <span className="badge bg-warn/15 text-warn border border-warn/30 text-[10px]">
                كتم: باقي {minutesRemaining}د
              </span>
            ) : isSilent ? (
              <span className="badge badge-neutral text-[10px]">وضع الصمت</span>
            ) : (
              <span className="badge badge-profit text-[10px]">نشط</span>
            )}
          </div>

          {/* Anti-Spam Control Action: 30-Minute Snooze Button */}
          <div className="p-3 bg-black/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between text-2xs text-fg-muted">
              <span>التحكم في التنبيهات</span>
              {isSnoozed ? (
                <button
                  type="button"
                  onClick={clearSnooze}
                  className="text-accent hover:underline font-semibold"
                >
                  فك الكتم الآن
                </button>
              ) : (
                <span className="text-fg-subtle">كتم النوافذ المنبثقة</span>
              )}
            </div>

            {isSnoozed ? (
              <div className="rounded-lg border border-warn/30 bg-warn/10 p-2.5 text-xs text-warn flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>مكتوم لـ <strong>{minutesRemaining} دقيقة</strong></span>
                </div>
                <button
                  type="button"
                  onClick={clearSnooze}
                  className="btn-secondary h-6 px-2 text-[10px]"
                >
                  تشغيل
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => snoozeNotifications(30)}
                  className="btn h-8 bg-warn/15 text-warn border border-warn/30 hover:bg-warn/25 text-2xs font-bold justify-center"
                >
                  <BellOff size={13} /> كتم 30 دقيقة
                </button>
                <button
                  type="button"
                  onClick={toggleSilentMode}
                  className={clsx(
                    'btn h-8 text-2xs font-semibold justify-center border',
                    isSilent ? 'bg-loss-deep/30 border-loss/40 text-loss' : 'btn-secondary'
                  )}
                >
                  {isSilent ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {isSilent ? 'فك الكتم' : 'وضع الصمت'}
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-white/8 p-1">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-fg-subtle py-8">
                ما فيش إشعارات جديدة. كلشي على خير!
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-2.5 hover:bg-white/8 rounded-lg transition-colors">
                  <div className="flex items-center justify-between gap-1">
                    <span className="badge badge-accent text-[9px] uppercase tracking-wider">
                      {n.tag || 'تنبيه'}
                    </span>
                    <span className="text-[10px] text-fg-subtle">{n.time}</span>
                  </div>
                  <h5 className="mt-1 text-xs font-semibold text-fg">{n.title}</h5>
                  <p className="mt-0.5 text-2xs text-fg-muted leading-relaxed">{n.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-black/20 backdrop-blur-xl flex justify-between items-center text-2xs">
              <span className="text-fg-subtle">{notifications.length} تنبيهات</span>
              <button
                type="button"
                onClick={clearNotifications}
                className="btn-ghost h-6 px-2 text-2xs text-loss hover:bg-loss-deep/20"
              >
                مسح الكل
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ title, subtitle }) {
  const viewRange = useAppStore((s) => s.viewRange);
  const setViewRange = useAppStore((s) => s.setViewRange);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useAppStore((s) => s.toggleRightPanel);

  return (
    <header className="drag-region relative z-30 flex h-topbar shrink-0 items-center gap-3 sm:gap-4 border-b border-white/6 bg-black/40 backdrop-blur-3xl px-3 sm:px-5" style={{ boxShadow: '0 0 80px -20px rgba(0, 255, 163, 0.15)' }}>
      <div className="min-w-0 shrink-0">
        <h1 className="truncate text-sm sm:text-base font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-2xs text-fg-subtle">{subtitle}</p>}
      </div>

      {/* View range toggle */}
      <div role="tablist" aria-label="Time range" className="no-drag segmented ml-2 hidden lg:inline-flex">
        {VIEW_RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={viewRange === r.id}
            data-active={viewRange === r.id}
            onClick={() => setViewRange(r.id)}
            className="segmented-item"
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Duo Partner & Account Switcher */}
        <DuoAccountSelector />

        {/* Notification Center with 30m Snooze / Anti-Spam */}
        <NotificationCenter />

        {/* Toggle Right Panel */}
        <button
          type="button"
          onClick={toggleRightPanel}
          className="no-drag btn-icon hidden xl:inline-flex"
          aria-label={rightPanelOpen ? 'Hide stats panel' : 'Show stats panel'}
        >
          {rightPanelOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </button>

        {/* Polished + Record Trade Button */}
        <button
          type="button"
          onClick={() => openAddTransaction()}
          className="no-drag group relative inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 sm:px-6 py-3 text-xs sm:text-sm font-black text-ink-950 shadow-2xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 shrink-0 cursor-pointer overflow-hidden border border-profit/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus size={20} strokeWidth={3.5} className="shrink-0 relative z-10 group-hover:rotate-180 transition-transform duration-300" />
          <span className="hidden sm:inline font-black tracking-wide relative z-10">تسجيل صفقة</span>
          <span className="sm:hidden font-black tracking-wide relative z-10">صفقة</span>
        </button>
      </div>
    </header>
  );
}
