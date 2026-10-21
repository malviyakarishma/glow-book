/** Local-calendar date helpers — never use toISOString() for YYYY-MM-DD (UTC shifts the day). */

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function localToday(): string {
  return formatLocalDate(new Date());
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDate(dateStr: string, days: number): string {
  const next = parseLocalDate(dateStr);
  next.setDate(next.getDate() + days);
  return formatLocalDate(next);
}

export function eachDateInRange(start: string, end: string): string[] {
  if (!start || !end) return start ? [start] : [];
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = shiftDate(cursor, 1);
    if (dates.length > 366) break;
  }
  return dates;
}

export function formatReadableDate(dateStr: string, locale: string): string {
  if (!dateStr) return '';
  try {
    return parseLocalDate(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function isToday(dateStr: string, today = localToday()): boolean {
  return dateStr === today;
}

export function isTomorrow(dateStr: string, today = localToday()): boolean {
  return dateStr === shiftDate(today, 1);
}
