import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-base font-medium">Failed to load birthdays.</span>
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
            No birthdays yet. Add some to get started! 🎉
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
            <BirthdayListItem key={b._id} birthday={b} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
