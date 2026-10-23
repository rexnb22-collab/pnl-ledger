const pad = (n) => String(n).padStart(2, '0');

export const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISODate(new Date());

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const addYears = (d, n) => new Date(d.getFullYear() + n, d.getMonth(), 1);
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
/** Monday-based weekday index: Mon = 0 … Sun = 6 */
export const weekdayIndex = (d) => (d.getDay() + 6) % 7;
export const startOfWeek = (d) => addDays(d, -weekdayIndex(d));
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/**
 * Monday-first month grid. Pads with trailing/leading days from adjacent
 * months so the grid is always full weeks (4–6 rows).
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = weekdayIndex(first);
  const cellCount = Math.ceil((lead + daysInMonth(year, month)) / 7) * 7;
  const start = addDays(first, -lead);
  return Array.from({ length: cellCount }, (_, i) => {
    const date = addDays(start, i);
    return { date, iso: toISODate(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

/** Inclusive [start, end] ISO range for a view range anchored on `focus`. `null` = unbounded. */
export function getPeriodRange(range, focus) {
  switch (range) {
    case 'week': {
      const s = startOfWeek(focus);
      return { start: toISODate(s), end: toISODate(addDays(s, 6)) };
    }
    case 'month':
      return { start: toISODate(startOfMonth(focus)), end: toISODate(endOfMonth(focus)) };
    case 'year':
      return { start: `${focus.getFullYear()}-01-01`, end: `${focus.getFullYear()}-12-31` };
    default:
      return { start: null, end: null };
  }
}

export function getPreviousPeriodFocus(range, focus) {
  if (range === 'week') return addDays(focus, -7);
  if (range === 'month') return addMonths(focus, -1);
  if (range === 'year') return addYears(focus, -1);
  return null;
}

export function shiftFocus(range, focus, dir) {
  if (range === 'week') return addDays(startOfWeek(focus), 7 * dir);
  if (range === 'month') return addMonths(focus, dir);
  if (range === 'year') return addYears(focus, dir);
  return focus;
}

export function formatPeriodLabel(range, focus) {
  if (range === 'week') {
    const s = startOfWeek(focus);
    const e = addDays(s, 6);
    const left = `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}`;
    const right = s.getMonth() === e.getMonth() ? `${e.getDate()}` : `${MONTH_SHORT[e.getMonth()]} ${e.getDate()}`;
    return `${left} – ${right}, ${e.getFullYear()}`;
  }
  if (range === 'month') return `${MONTH_NAMES[focus.getMonth()]} ${focus.getFullYear()}`;
  if (range === 'year') return String(focus.getFullYear());
  return 'All time';
}

export const formatLongDate = (iso) =>
  parseISODate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

export const formatShortDate = (iso) =>
  parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
