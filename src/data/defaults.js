export const DEFAULT_ACCOUNTS = [
  { id: 'all', name: 'All Accounts', type: 'aggregate', color: '#06B6D4' },
  { id: 'main', name: 'Main Account', type: 'Trading', color: '#22C55E' },
];

export const ACCOUNT_COLORS = ['#22C55E', '#A855F7', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'];

/** `sign` turns the positive amount the user types into a signed P&L value. */
export const TRANSACTION_TYPES = [
  { id: 'trade_profit', label: 'Trade Profit', sign: 1 },
  { id: 'trade_loss', label: 'Trade Loss', sign: -1 },
  { id: 'income', label: 'Income', sign: 1 },
  { id: 'expense', label: 'Expense', sign: -1 },
];

export const CATEGORIES = [
  'Stocks', 'Options', 'Futures', 'Forex', 'Crypto', 'Indices', 'Commodities',
  'Sales', 'Client work', 'Fees', 'Software', 'Marketing', 'Inventory', 'Other',
];
