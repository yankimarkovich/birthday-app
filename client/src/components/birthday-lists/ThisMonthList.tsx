import { useThisMonthsBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
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
    return <ErrorState message="Failed to load this month's birthdays." onRetry={refetch} />;
  }

  if (data.count === 0) {
    return <EmptyState message="No birthdays this month! 🎂" />;
  }

  const enriched = data.data.map((b) => {
    const next = nextOccurrence(b.date);
    const daysUntil = Math.floor((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isTodayBirthday = isToday(b.date);
    return { ...b, next, daysUntil, isTodayBirthday };
  });

  const sorted = enriched.sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y-2 divide-border">
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
      </CardContent>
    </Card>
  );
}
