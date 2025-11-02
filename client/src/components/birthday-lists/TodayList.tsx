import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { BirthdayListItem } from './BirthdayListItem';
import type { Birthday } from '@/types';

interface TodayListProps {
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
}

export function TodayList({ onEdit, onDelete }: TodayListProps) {
  // Use all birthdays and filter on client side to fix timezone bug
  // Server uses UTC, but we want to use user's local timezone
  const { data: allData, isLoading, isError, refetch } = useBirthdays();

  // Filter birthdays to only include today's (using client's timezone)
  const data = useMemo(() => {
    if (!allData) return null;

    const now = new Date();
    const todayBirthdays = allData.data.filter((b) => {
      const birthdayDate = new Date(b.date);
      return (
        birthdayDate.getMonth() === now.getMonth() && birthdayDate.getDate() === now.getDate()
      );
    });

    return {
      success: true as const,
      count: todayBirthdays.length,
      data: todayBirthdays,
    };
  }, [allData]);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <div className="bg-card border-2 border-destructive/20 rounded-xl p-8 text-destructive shadow-lg">
        <p className="text-base font-medium">Failed to load today's birthdays.</p>
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
        <p className="text-lg text-muted-foreground font-medium">
          No birthdays today! 🎂 Check back tomorrow.
        </p>
      </div>
    );
  }

  return (
    <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
      {data.data.map((b) => (
        <BirthdayListItem
          key={b._id}
          birthday={b}
          onEdit={onEdit}
          onDelete={onDelete}
          badge={
            <Badge variant="default" className="bg-accent text-accent-foreground text-sm px-3 py-1">
              Today! 🎉
            </Badge>
          }
          dateFormat="MMM d, yyyy"
        />
      ))}
    </ul>
  );
}
