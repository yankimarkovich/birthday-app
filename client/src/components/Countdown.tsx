import { useEffect, useState } from 'react';
import { getCountdownParts } from '@/lib/date';

export function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { days, hours, minutes, seconds } = getCountdownParts(target, now);

  return (
    <span className="tabular-nums text-sm text-muted-foreground">
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
}

