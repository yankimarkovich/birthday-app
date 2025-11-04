import { getYear, addYears, isBefore, differenceInMilliseconds } from 'date-fns';

export function nextOccurrence(dateInput: string | Date, nowInput: Date = new Date()): Date {
  const source = new Date(dateInput);
  const now = new Date(nowInput);

  const targetThisYear = new Date(now.getFullYear(), source.getMonth(), source.getDate());
  if (isNaN(targetThisYear.getTime())) {
    return source;
  }

  if (isBefore(targetThisYear, now)) {
    return addYears(targetThisYear, 1);
  }
  return targetThisYear;
}

export function getCountdownParts(target: Date, nowInput: Date = new Date()) {
  const now = new Date(nowInput);
  let delta = Math.max(0, differenceInMilliseconds(target, now));

  const days = Math.floor(delta / (24 * 60 * 60 * 1000));
  delta -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(delta / (60 * 60 * 1000));
  delta -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(delta / (60 * 1000));
  delta -= minutes * 60 * 1000;
  const seconds = Math.floor(delta / 1000);

  return { days, hours, minutes, seconds, totalMs: differenceInMilliseconds(target, now) };
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
