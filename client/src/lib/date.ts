export function nextOccurrence(dateInput: string | Date, nowInput: Date = new Date()): Date {
  const source = new Date(dateInput);
  const now = new Date(nowInput);

  const targetThisYear = new Date(now.getFullYear(), source.getMonth(), source.getDate());
  if (isNaN(targetThisYear.getTime())) {
    return source; // fallback
  }
  // If birthday already passed today (end of day), schedule for next year
  if (targetThisYear.getTime() < now.getTime() - 0) {
    return new Date(now.getFullYear() + 1, source.getMonth(), source.getDate());
  }
  return targetThisYear;
}

export function getCountdownParts(target: Date, nowInput: Date = new Date()) {
  const now = new Date(nowInput);
  let delta = Math.max(0, target.getTime() - now.getTime());

  const days = Math.floor(delta / (24 * 60 * 60 * 1000));
  delta -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(delta / (60 * 60 * 1000));
  delta -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(delta / (60 * 1000));
  delta -= minutes * 60 * 1000;
  const seconds = Math.floor(delta / 1000);

  return { days, hours, minutes, seconds, totalMs: target.getTime() - now.getTime() };
}

export function isToday(dateInput: string | Date, nowInput: Date = new Date()): boolean {
  const d = new Date(dateInput);
  const n = new Date(nowInput);
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
}

