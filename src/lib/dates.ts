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

export type AmPm = 'AM' | 'PM';

export interface Time12 {
  hour: number; // 1–12
  minute: number; // 0–59
  period: AmPm;
}

export const DEFAULT_TIME_12 = '11:00 AM';

/** Parse free-form times ("11:00 AM", "3:30pm", "15:30") into 12-hour parts. */
export function parseTime12(time: string): Time12 | null {
  const raw = time.trim();
  if (!raw) return null;

  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hour = Number(ampm[1]);
    const minute = Math.min(59, Number(ampm[2]));
    const period = ampm[3].toUpperCase() as AmPm;
    if (hour < 1 || hour > 12) hour = ((hour - 1 + 12) % 12) + 1;
    return { hour, minute, period };
  }

  const h24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (h24) {
    const h = Math.min(23, Number(h24[1]));
    const minute = Math.min(59, Number(h24[2]));
    const period: AmPm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return { hour, minute, period };
  }

  return null;
}

export function formatTime12(parts: Time12): string {
  const hour = Math.min(12, Math.max(1, parts.hour));
  const minute = Math.min(59, Math.max(0, parts.minute));
  return `${hour}:${String(minute).padStart(2, '0')} ${parts.period}`;
}

/** Normalize any stored time to "h:mm AM/PM"; falls back to default. */
export function toDisplayTime12(time: string, fallback = DEFAULT_TIME_12): string {
  const parsed = parseTime12(time);
  return parsed ? formatTime12(parsed) : fallback;
}

export function isToday(dateStr: string, today = localToday()): boolean {
  return dateStr === today;
}

export function isTomorrow(dateStr: string, today = localToday()): boolean {
  return dateStr === shiftDate(today, 1);
}
