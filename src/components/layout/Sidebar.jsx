import clsx from 'clsx';
import {
  CalendarDays,
  ChartCandlestick,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Flame,
  Headset,
  LogOut,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const NAV_ITEMS = [
  { id: 'calendar', label: 'رزنامة الربح والخسارة', icon: CalendarDays },
  { id: 'analytics', label: 'التحليلات', icon: ChartCandlestick },
  { id: 'accounts', label: 'حسابات التداول', icon: Wallet },
  { id: 'news', label: 'أخبار السوق والذهب', icon: Flame, badge: 'LIVE' },
  { id: 'export', label: 'تصدير البيانات', icon: Download },
];

const FOOTER_ITEMS = [
  { id: 'contact', label: 'تواصل معنا', icon: Headset },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
  { id: 'logout', label: 'تسجيل الخروج', icon: LogOut, danger: true },
];

function NavItem({ item, active, collapsed, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-250 ease-out-expo active:scale-[0.96]',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-gradient-to-r from-profit/20 to-profit/10 text-fg shadow-[inset_0_0_0_1px_rgba(0,255,163,0.3),0_0_32px_-8px_rgba(0,255,163,0.4)]'
          : item.badge
            ? 'text-amber-300 hover:bg-amber-400/15 hover:text-amber-200'
            : item.danger
              ? 'text-fg-muted hover:bg-loss/15 hover:text-loss'
              : 'text-fg-muted hover:bg-white/8 hover:text-fg',
      )}
    >
      {/* Active rail indicator */}
      <span
        className={clsx(
          'absolute -left-3.5 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-profit to-profit-bright shadow-glow-profit transition-all duration-250',
          active ? 'opacity-100' : 'scale-y-0 opacity-0',
        )}
      />
      <Icon
        size={20}
        strokeWidth={active ? 2.5 : 2}
        className={clsx(
          'shrink-0 transition-colors',
          active ? 'text-profit drop-shadow-[0_0_10px_rgba(0,255,163,0.7)]' : !item.badge && !item.danger && 'group-hover:text-fg',
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && active && <span className="ml-auto h-2 w-2 animate-pulse-glow rounded-full bg-profit shadow-glow-profit" />}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-lg bg-gradient-to-r from-amber-400 to-red-500 px-2 py-0.5 text-[9px] font-black text-ink-950 tracking-wider shadow-lg">
          {item.badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-xl border border-white/12 bg-black/60 backdrop-blur-2xl px-3 py-1.5 text-xs font-bold text-fg opacity-0 shadow-card-hover transition-all duration-250 group-hover:translate-x-0.5 group-hover:opacity-100">
          {item.label}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ collapsed }) {
  const activeNav = useAppStore((s) => s.activeNav);
  const setActiveNav = useAppStore((s) => s.setActiveNav);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={clsx(
        'relative flex h-full shrink-0 flex-col border-r border-white/6 bg-black/40 backdrop-blur-3xl transition-[width] duration-350 ease-out-expo',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
      )}
      style={{ boxShadow: '0 0 100px -25px rgba(0, 255, 163, 0.12)' }}
    >
      {/* Logo header */}
      <div className={clsx('drag-region flex h-topbar items-center gap-3 border-b border-white/6 px-4', collapsed && 'justify-center px-0')}>
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/30 backdrop-blur-2xl ring-1 ring-white/10 shadow-xl">
          <svg viewBox="0 0 32 32" className="h-5.5 w-5.5" fill="none">
            <path d="M5 22l6-7 5 3.5L26 7" stroke="#00FFA3" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26" cy="7" r="2.6" fill="#00FFA3" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-glow rounded-full bg-profit shadow-glow-profit" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="truncate text-[16px] font-black leading-tight tracking-tight">
              PnL <span className="text-profit">Ledger</span>
            </p>
            <p className="text-2xs font-bold uppercase tracking-[0.14em] text-fg-subtle">Duo Traders</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={clsx('flex-1 px-3 py-6', collapsed ? 'overflow-visible' : 'overflow-y-auto')}>
        {!collapsed && <p className="mb-3 px-3.5 text-2xs font-bold uppercase tracking-[0.14em] text-fg-subtle">القائمة</p>}
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} active={activeNav === item.id} onSelect={setActiveNav} />
          ))}
        </div>
      </nav>

      {/* Footer: settings + 2-trader vault */}
      <div className="space-y-1.5 border-t border-white/6 p-3">
        {FOOTER_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} collapsed={collapsed} active={activeNav === item.id} onSelect={setActiveNav} />
        ))}

        <div
          className={clsx(
            'mt-3 flex w-full items-center gap-3 rounded-xl border border-white/12 bg-black/30 backdrop-blur-2xl p-2.5 text-left transition-all duration-250 hover:border-profit/40',
            collapsed && 'justify-center border-transparent bg-transparent p-1',
          )}
        >
          <div className="relative shrink-0 flex items-center -space-x-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-profit to-profit-deep text-[10px] font-black text-ink-950 ring-2 ring-ink-900 shadow-lg">
              T1
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-[10px] font-black text-ink-950 ring-2 ring-ink-900 shadow-lg">
              T2
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-fg">خزينة شريك المتداولين</p>
              <p className="truncate text-[10px] text-profit font-bold">● شريكين متزامنين</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="btn-ghost mt-2 w-full justify-center px-0 py-2 text-xs font-bold"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={17} /> : (<><ChevronsLeft size={17} /> Collapse</>)}
        </button>
      </div>
    </aside>
  );
}
