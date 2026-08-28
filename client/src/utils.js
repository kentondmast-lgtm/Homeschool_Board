export const SUBJECTS = ['Math', 'Reading', 'Science', 'Writing', 'Art', 'PE'];

export const RECUR_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Repeats daily' },
  { value: 'weekly', label: 'Repeats weekly' },
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function dateLabel(dateStr) {
  if (!dateStr) return 'Today';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function recurLabel(recurring) {
  if (recurring === 'daily') return '↻ Daily';
  if (recurring === 'weekly') return '↻ Weekly';
  return '';
}

// Night mode runs 20:00 (inclusive) through 06:00 (exclusive), based on
// the device's own local clock.
export function isNightTime(date) {
  const h = date.getHours();
  return h >= 20 || h < 6;
}

export function buildMonthGrid(now, weekPattern) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    const items = dow >= 1 && dow <= 5 && weekPattern[dow - 1] ? weekPattern[dow - 1].items : [];
    cells.push({ blank: false, day: d, items, isToday: d === now.getDate() });
  }
  while (cells.length % 7 !== 0) cells.push({ blank: true });
  return cells;
}
