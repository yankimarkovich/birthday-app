import { getYear, addYears, startOfDay, isBefore } from 'date-fns';

export function nextOccurrence(dateInput: string | Date, nowInput: Date = new Date()): Date {
  const source = new Date(dateInput);
  const now = new Date(nowInput);

  // Create this year's occurrence at start of day
  const targetThisYear = new Date(now.getFullYear(), source.getMonth(), source.getDate());
  if (isNaN(targetThisYear.getTime())) {
    return source;
  }

  // Compare dates only (ignore time) - if today is Nov 8, don't count it as "past"
  const targetThisYearStartOfDay = startOfDay(targetThisYear);
  const nowStartOfDay = startOfDay(now);

  if (isBefore(targetThisYearStartOfDay, nowStartOfDay)) {
    return addYears(targetThisYear, 1);
  }
  return targetThisYear;
}

export function isToday(dateInput: string | Date, nowInput: Date = new Date()): boolean {
  const d = new Date(dateInput);
  const n = new Date(nowInput);
  return d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function wasWishSentThisYear(lastWishSent: string | undefined): boolean {
  if (!lastWishSent) return false;

  return getYear(new Date(lastWishSent)) === getYear(new Date());
}
