import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
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
    return (
      <div className="bg-card border-2 border-destructive/20 rounded-xl p-8 text-destructive shadow-lg">
        <p className="text-base font-medium">Failed to load birthdays.</p>
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
          No birthdays yet. Add some to get started! 🎉
        </p>
      </div>
    );
  }

  return (
    <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
      {data.data.map((b) => (
        <BirthdayListItem key={b._id} birthday={b} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
