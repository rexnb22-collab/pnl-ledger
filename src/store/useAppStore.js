import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ACCOUNT_COLORS, DEFAULT_ACCOUNTS } from '../data/defaults';
import { parseISODate, shiftFocus, todayISO, toISODate } from '../lib/date';
import { syncTransaction } from '../lib/integrations';

export const VIEW_RANGES = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All time' },
];

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const reportSave = (ok, err) => {
  if (!ok) console.error('Failed to save ledger', err);
  if (useAppStore.getState().storageError === ok) useAppStore.setState({ storageError: !ok });
};

// Desktop build: JSON file in the user's app-data folder (via preload). Browser: localStorage.
const backend = globalThis.window?.pnlDesktop?.storage;
const storage = createJSONStorage(() => ({
  getItem: (key) => (backend ? backend.getItem(key) : localStorage.getItem(key)),
  removeItem: (key) => (backend ? backend.removeItem(key) : localStorage.removeItem(key)),
  setItem: (key, value) => {
    if (backend) {
      backend.setItem(key, value).then(() => reportSave(true), (err) => reportSave(false, err));
      return;
    }
    try {
      localStorage.setItem(key, value);
      reportSave(true);
    } catch (err) {
      reportSave(false, err);
    }
  },
}));

export const useAppStore = create(
  persist(
    (set, get) => ({
      activeNav: 'calendar',
      viewRange: 'week',
      focusDate: todayISO(),
      selectedDate: null,
      accounts: DEFAULT_ACCOUNTS,
      transactions: [],
      selectedAccountId: 'all',
      /** 2-Trader Partnership Setup: */
      traders: [
        { id: 'trader_1', name: 'Trader 1 (You)', color: '#22C55E', avatar: 'T1', role: 'Swing & Crypto' },
        { id: 'trader_2', name: 'Trader 2 (Partner)', color: '#06B6D4', avatar: 'T2', role: 'Forex & Gold (XAUUSD)' },
      ],
      /** 'all' (Shared Duo Ledger) | 'trader_1' | 'trader_2' */
      selectedTraderId: 'all',
      /** Who is currently logged in/entering trades: 'trader_1' | 'trader_2' */
      activeTraderId: 'trader_1',

      /** Anti-Spam Notification Controls: */
      notificationSettings: {
        snoozeUntil: null, // timestamp in ms; if > Date.now(), all notifications are muted
        silentMode: false,
        onlyHighImpact: true,
      },
      notifications: [
        { id: 'notif-1', time: '10m ago', title: 'XAUUSD Gold Bullish Alert', body: 'Gold consolidating near $2,735 ATH zone with heavy volume.', unread: true, tag: 'XAUUSD', highImpact: true },
        { id: 'notif-2', time: '35m ago', title: 'Partner Trade Shared', body: 'Trader 2 logged +$620.00 on NQ Futures breakout.', unread: true, tag: 'Partner', highImpact: false },
        { id: 'notif-3', time: '1h ago', title: 'High-Impact Economic Warning', body: 'US CPI in 45m. High volatility expected on XAUUSD and USD pairs.', unread: false, tag: 'News', highImpact: true },
      ],

      monthlyGoal: 10000,
      yearlyGoal: 12000,
      lifetimeGoal: 50000,
      startingCapital: 0,
      hidePnL: false,
      sidebarCollapsed: false,
      rightPanelOpen: true,
      /** null | { key, tx: existing transaction or null, draft: prefilled fields } */
      txModal: null,
      /** ISO date whose transactions are listed in the day details modal. */
      dayDetails: null,
      storageError: false,
      integrations: {
        discordEnabled: false,
        discordWebhook: '',
        discordNotifyChanges: false,
        sheetsEnabled: false,
        sheetsUrl: '',
      },
      /** Last result per service: { ok, at, message | error, auto } */
      syncStatus: {},

      setActiveNav: (activeNav) => set({ activeNav }),
      setViewRange: (viewRange) => set({ viewRange }),
      setSelectedAccount: (selectedAccountId) => set({ selectedAccountId }),
      shiftPeriod: (dir) =>
        set((s) => ({ focusDate: toISODate(shiftFocus(s.viewRange, parseISODate(s.focusDate), dir)) })),
      goToToday: () => set({ focusDate: todayISO(), selectedDate: todayISO() }),
      /** Jump into a narrower view, e.g. Year → Month when a month card is clicked. */
      drillInto: (viewRange, focusDate) => set({ viewRange, focusDate }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
      setMonthlyGoal: (monthlyGoal) => set({ monthlyGoal }),
      setYearlyGoal: (yearlyGoal) => set({ yearlyGoal }),
      setLifetimeGoal: (lifetimeGoal) => set({ lifetimeGoal }),
      setStartingCapital: (startingCapital) => set({ startingCapital }),
      setHidePnL: (hidePnL) => set({ hidePnL }),

      openAddTransaction: (draft = {}) => set({ txModal: { key: Date.now(), tx: null, draft } }),
      openEditTransaction: (tx) => set({ txModal: { key: Date.now(), tx, draft: {} } }),
      closeTransactionModal: () => set({ txModal: null }),
      openDayDetails: (dayDetails) => set({ dayDetails, selectedDate: dayDetails }),
      closeDayDetails: () => set({ dayDetails: null }),

      saveTransaction: (data) => {
        const { transactions } = get();
        const existing = data.id && transactions.find((t) => t.id === data.id);
        const tx = existing
          ? { ...existing, ...data, updatedAt: Date.now() }
          : { ...data, id: uid(), createdAt: Date.now() };
        set({
          transactions: existing ? transactions.map((t) => (t.id === tx.id ? tx : t)) : [...transactions, tx],
          txModal: null,
          focusDate: tx.date,
          selectedDate: tx.date,
        });
        get().pushToIntegrations(existing ? 'update' : 'create', tx);
      },
      deleteTransaction: (id) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) return;
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
        get().pushToIntegrations('delete', tx);
      },

      updateIntegrations: (patch) => set((s) => ({ integrations: { ...s.integrations, ...patch } })),
      setSyncStatus: (service, status) => set((s) => ({ syncStatus: { ...s.syncStatus, [service]: status } })),
      clearSyncError: (service) =>
        set((s) => ({ syncStatus: { ...s.syncStatus, [service]: undefined } })),
      pushToIntegrations: async (action, tx) => {
        const results = await syncTransaction(get(), action, tx);
        if (Object.keys(results).length) set((s) => ({ syncStatus: { ...s.syncStatus, ...results } }));
      },

      /** Creates an account and returns its id. */
      addAccount: (name, type = 'Trading') => {
        const id = uid();
        const color = ACCOUNT_COLORS[(get().accounts.length - 1) % ACCOUNT_COLORS.length];
        set((s) => ({ accounts: [...s.accounts, { id, name, type, color }] }));
        return id;
      },
      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter((t) => t.accountId !== id),
          selectedAccountId: s.selectedAccountId === id ? 'all' : s.selectedAccountId,
        })),
      setTransactions: (transactions) => set({ transactions }),
      setSelectedTraderId: (selectedTraderId) => set({ selectedTraderId }),
      setActiveTraderId: (activeTraderId) => set({ activeTraderId }),
      updateTrader: (id, patch) =>
        set((s) => ({
          traders: s.traders.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      snoozeNotifications: (minutes = 30) =>
        set((s) => ({
          notificationSettings: {
            ...s.notificationSettings,
            snoozeUntil: Date.now() + minutes * 60 * 1000,
          },
        })),
      clearSnooze: () =>
        set((s) => ({
          notificationSettings: {
            ...s.notificationSettings,
            snoozeUntil: null,
          },
        })),
      toggleSilentMode: () =>
        set((s) => ({
          notificationSettings: {
            ...s.notificationSettings,
            silentMode: !s.notificationSettings.silentMode,
          },
        })),
      clearNotifications: () => set({ notifications: [] }),
      addTradeComment: (txId, text) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === txId ? { ...t, partnerNotes: text } : t,
          ),
        })),
      resetAllData: () =>
        set({
          transactions: [],
          accounts: DEFAULT_ACCOUNTS,
          selectedAccountId: 'all',
          selectedTraderId: 'all',
          monthlyGoal: 10000,
          yearlyGoal: 12000,
          lifetimeGoal: 50000,
          startingCapital: 0,
        }),
    }),
    {
      name: 'pnl-ledger',
      version: 1,
      storage,
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        integrations: { ...current.integrations, ...persisted?.integrations },
        notificationSettings: {
          ...current.notificationSettings,
          ...persisted?.notificationSettings,
        },
      }),
      partialize: (s) => ({
        transactions: s.transactions,
        accounts: s.accounts,
        traders: s.traders,
        selectedTraderId: s.selectedTraderId,
        activeTraderId: s.activeTraderId,
        notificationSettings: s.notificationSettings,
        monthlyGoal: s.monthlyGoal,
        yearlyGoal: s.yearlyGoal,
        lifetimeGoal: s.lifetimeGoal,
        startingCapital: s.startingCapital,
        integrations: s.integrations,
        selectedAccountId: s.selectedAccountId,
        sidebarCollapsed: s.sidebarCollapsed,
        rightPanelOpen: s.rightPanelOpen,
      }),
    },
  ),
);
