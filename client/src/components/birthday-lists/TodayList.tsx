import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-base font-medium">Failed to load today's birthdays.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (data.count === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-12 text-center">
          <p className="text-lg text-muted-foreground font-medium">
            No birthdays today! 🎂 Check back tomorrow.
          </p>
        </CardContent>
      </Card>
    );
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
