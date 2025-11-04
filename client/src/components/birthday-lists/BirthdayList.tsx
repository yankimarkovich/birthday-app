import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { BirthdayListItem } from './BirthdayListItem';
import type { Birthday } from '@/types';

interface BirthdayListProps {
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
}

export function BirthdayList({ onEdit, onDelete }: BirthdayListProps) {
  const { data, isLoading, isError, refetch } = useBirthdays();

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load birthdays." onRetry={refetch} />;
  }

  if (data.count === 0) {
    return <EmptyState message="No birthdays yet. Add some to get started! 🎉" />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y-2 divide-border">
          {data.data.map((b) => (
            <BirthdayListItem key={b._id} birthday={b} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
