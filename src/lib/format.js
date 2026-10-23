const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (value) => currency.format(value);

export const formatPnL = (value, { compact: useCompact = false, compactFrom = 10_000 } = {}) => {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const body = useCompact && abs >= compactFrom ? `$${compact.format(abs)}` : currency.format(abs);
  return `${sign}${body}`;
};

export const formatPercent = (value, digits = 1) => `${value.toFixed(digits)}%`;

/** Period-over-period change; clamps runaway values when the baseline is near zero. */
export const formatChange = (value) => (Math.abs(value) >= 1000 ? '>999%' : formatPercent(Math.abs(value)));

const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const formatCurrencyWhole = (value) => whole.format(value);

export const pnlTone = (value) => (value > 0 ? 'profit' : value < 0 ? 'loss' : 'neutral');
