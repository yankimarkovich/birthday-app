import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useMemo } from 'react';
import { BirthdayListItem } from './BirthdayListItem';
import type { Birthday } from '@/types';

interface TodayListProps {
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
}

export function TodayList({ onEdit, onDelete }: TodayListProps) {
  const { data: allData, isLoading, isError, refetch } = useBirthdays();

  const data = useMemo(() => {
    if (!allData) return null;

    const now = new Date();
    const todayBirthdays = allData.data.filter((b) => {
      const birthdayDate = new Date(b.date);
      return birthdayDate.getMonth() === now.getMonth() && birthdayDate.getDate() === now.getDate();
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
    return <ErrorState message="Failed to load today's birthdays." onRetry={refetch} />;
  }

  if (data.count === 0) {
    return <EmptyState message="No birthdays today! 🎂 Check back tomorrow." />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y-2 divide-border">
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
      </CardContent>
    </Card>
  );
}
