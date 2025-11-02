import { useThisMonthsBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Countdown } from '@/components/Countdown';
import { format } from 'date-fns';
import { nextOccurrence, isToday } from '@/lib/date';
import { BirthdayListItem } from './BirthdayListItem';
import type { Birthday } from '@/types';

interface ThisMonthListProps {
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
}

export function ThisMonthList({ onEdit, onDelete }: ThisMonthListProps) {
  const { data, isLoading, isError, refetch } = useThisMonthsBirthdays();

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <div className="bg-card border-2 border-destructive/20 rounded-xl p-8 text-destructive shadow-lg">
        <p className="text-base font-medium">Failed to load this month's birthdays.</p>
        <button
          className="underline text-base mt-2 hover:text-destructive/80"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.count === 0) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-border rounded-xl p-12 text-center shadow-lg">
        <p className="text-lg text-muted-foreground font-medium">No birthdays this month! 🎂</p>
      </div>
    );
  }

  const enriched = data.data.map((b) => {
    const next = nextOccurrence(b.date);
    const daysUntil = Math.floor((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isTodayBirthday = isToday(b.date);
    return { ...b, next, daysUntil, isTodayBirthday };
  });

  const sorted = enriched.sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
      {sorted.map((b) => (
        <BirthdayListItem
          key={b._id}
          birthday={b}
          onEdit={onEdit}
          onDelete={onDelete}
          badge={
            b.isTodayBirthday ? (
              <Badge
                variant="default"
                className="bg-accent text-accent-foreground text-sm px-3 py-1"
              >
                Today! 🎉
              </Badge>
            ) : undefined
          }
          dateInfo={
            <>
              {format(new Date(b.date), 'MMM d')} •{' '}
              <span className="font-bold text-foreground">
                <Countdown target={b.next} />
              </span>
            </>
          }
        />
      ))}
    </ul>
  );
}
