import { useState } from 'react';
import { LogOut, Trash2, Check } from 'lucide-react';
import AppLayout from './components/layout/AppLayout';
import PnLCalendar from './components/calendar/PnLCalendar';
import AddTransactionModal from './components/transactions/AddTransactionModal';
import DayDetailsModal from './components/transactions/DayDetailsModal';
import SettingsView from './components/settings/SettingsView';
import AnalyticsView from './components/analytics/AnalyticsView';
import AccountsView from './components/accounts/AccountsView';
import ExportView from './components/export/ExportView';
import MarketNewsView from './components/news/MarketNewsView';
import ContactView from './components/contact/ContactView';
import Modal from './components/ui/Modal';
import { useAppStore } from './store/useAppStore';
import { useIsPhone } from './hooks/useMediaQuery';

const PAGE_TITLES = {
  calendar: 'P&L Calendar',
  analytics: 'Analytics & Performance',
  accounts: 'Trading Accounts',
  news: 'Market News & Economic Calendar',
  export: 'Export & Backup',
  contact: 'Support & FAQ',
  settings: 'Settings & Integrations',
  logout: 'Logout / Session',
};

function LogoutModal({ onClose }) {
  const resetAllData = useAppStore((s) => s.resetAllData);
  const [cleared, setCleared] = useState(false);

  const handleReset = () => {
    resetAllData();
    setCleared(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Modal
      onClose={onClose}
      title="Exit Session"
      subtitle="Manage your local session or reset app data"
      icon={LogOut}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Close
          </button>
          {!cleared && (
            <button
              type="button"
              onClick={handleReset}
              className="btn border border-loss/50 bg-loss-deep/20 text-loss hover:bg-loss-deep/40 font-semibold"
            >
              <Trash2 size={15} /> Clear Local Vault & Reset
            </button>
          )}
        </>
      }
    >
      <div className="space-y-3 py-2 text-sm text-fg-muted">
        {cleared ? (
          <div className="flex items-center gap-2 text-profit font-semibold">
            <Check size={18} />
            <span>All local data has been reset cleanly. Returning to calendar...</span>
          </div>
        ) : (
          <>
            <p>
              PnL Ledger operates completely locally in your browser. There is no central account login required.
            </p>
            <p className="text-xs text-fg-subtle">
              If you wish to wipe all local records, accounts, and integrations, click &ldquo;Clear Local Vault &amp; Reset&rdquo; below.
              Otherwise, your ledger remains safely stored on this computer.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function App() {
  const activeNav = useAppStore((s) => s.activeNav);
  const setActiveNav = useAppStore((s) => s.setActiveNav);
  const account = useAppStore((s) => s.accounts.find((a) => a.id === s.selectedAccountId));
  const isPhone = useIsPhone();
  const title = isPhone
    ? activeNav === 'news'
      ? 'Market News'
      : activeNav === 'analytics'
        ? 'Analytics'
        : (PAGE_TITLES[activeNav] ?? 'PnL Ledger')
    : (PAGE_TITLES[activeNav] ?? 'PnL Ledger');

  return (
    <>
      <AppLayout title={title} subtitle={account?.name}>
        {activeNav === 'calendar' && <PnLCalendar />}
        {activeNav === 'analytics' && <AnalyticsView />}
        {activeNav === 'accounts' && <AccountsView />}
        {activeNav === 'news' && <MarketNewsView />}
        {activeNav === 'export' && <ExportView />}
        {activeNav === 'contact' && <ContactView />}
        {activeNav === 'settings' && <SettingsView />}
      </AppLayout>

      {/* Modals */}
      <DayDetailsModal />
      <AddTransactionModal />
      {activeNav === 'logout' && <LogoutModal onClose={() => setActiveNav('calendar')} />}
    </>
  );
}
