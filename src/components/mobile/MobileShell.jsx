import clsx from 'clsx';
import { CalendarDays, Plus, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

function MobileTabBar() {
  const activeNav = useAppStore((s) => s.activeNav);
  const setActiveNav = useAppStore((s) => s.setActiveNav);
  const calendarActive = activeNav === 'calendar';

  return (
    <nav className="mj-tabbar shrink-0 px-3 pt-2">
      <div className="mj-tabbar-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.id === 'calendar'
              ? calendarActive
              : tab.id === 'analytics'
                ? activeNav === 'analytics'
                : !calendarActive && activeNav !== 'analytics';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveNav(tab.id)}
              className={clsx('mj-tab', active && 'mj-tab-active')}
            >
              <Icon size={active ? 22 : 20} strokeWidth={active ? 2.4 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobilePageHeader({ title, subtitle }) {
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  return (
    <header className="mj-page-header">
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
            {subtitle}
          </p>
        )}
      </div>
      <button type="button" onClick={() => openAddTransaction()} className="mj-plus" aria-label="Add trade">
        <Plus size={18} strokeWidth={2.6} />
      </button>
    </header>
  );
}

const EXTRA_LINKS = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'news', label: 'Market news' },
  { id: 'export', label: 'Export' },
  { id: 'contact', label: 'Support' },
];

export function MobileExtras() {
  const setActiveNav = useAppStore((s) => s.setActiveNav);
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {EXTRA_LINKS.map((item) => (
        <button key={item.id} type="button" onClick={() => setActiveNav(item.id)} className="mj-extra">
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function MobileShell({ title, subtitle, children }) {
  const activeNav = useAppStore((s) => s.activeNav);
  const isCalendar = activeNav === 'calendar';

  return (
    <div className="mj-shell">
      {!isCalendar && <MobilePageHeader title={title} subtitle={subtitle} />}
      <div className={clsx('min-h-0 flex-1 overflow-y-auto', !isCalendar && 'px-4 pb-4 pt-2')}>
        {activeNav === 'settings' && <MobileExtras />}
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
}
