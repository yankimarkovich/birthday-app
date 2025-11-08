import ReactCountdown from 'react-countdown';

export function Countdown({ target }: { target: Date }) {
  return (
    <ReactCountdown
      date={target}
      renderer={({ days, hours, minutes, seconds }) => (
        <span className="tabular-nums text-sm text-muted-foreground">
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      )}
    />
  );
}

