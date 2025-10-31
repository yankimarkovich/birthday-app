import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useBirthdays, useSendWish, useDeleteBirthday } from '@/hooks/useBirthdays';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AddBirthdayDialog from '@/components/AddBirthdayDialog';
import EditBirthdayDialog from '@/components/EditBirthdayDialog';
import { nextOccurrence, isToday } from '@/lib/date';
import { Countdown } from '@/components/Countdown';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-foreground">Birthday App</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Upcoming</h2>
            <AddBirthdayDialog />
          </div>
          <UpcomingList />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">All Birthdays</h2>
          <BirthdayList />
        </section>
      </main>
    </div>
  );
}

function UpcomingList() {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useBirthdays();
  const sendWish = useSendWish();
  const del = useDeleteBirthday();

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (isError || !data) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-red-500">
        Failed to load. <button className="underline" onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (data.count === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">
        No birthdays yet. Add some to get started.
      </div>
    );
  }

  const enriched = data.data.map((b) => {
    const next = nextOccurrence(b.date);
    return { ...b, next, ms: next.getTime() - Date.now() };
  });

  const sorted = enriched.sort((a, b) => a.ms - b.ms).slice(0, 10);

  return (
    <ul className="bg-card border border-border rounded-lg divide-y divide-border">
      {sorted.map((b) => {
        const today = isToday(b.date);
        return (
          <li key={b._id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-foreground font-medium">{b.name}</div>
                {today && <Badge variant="secondary">Today</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(b.date), 'MMM d')} • <Countdown target={b.next} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!today}
                onClick={async () => {
                  try {
                    await sendWish.mutateAsync(b._id);
                    toast({ title: 'Sent 🎉', description: `Wished ${b.name} a happy birthday` });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to send wish' });
                  }
                }}
              >
                Send Wish
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BirthdayList() {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useBirthdays();
  const sendWish = useSendWish();
  const del = useDeleteBirthday();

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (isError || !data)
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-red-500">
        Failed to load. <button className="underline" onClick={() => refetch()}>Retry</button>
      </div>
    );
  if (data.count === 0)
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">
        No birthdays yet. Add some to get started.
      </div>
    );

  return (
    <ul className="bg-card border border-border rounded-lg divide-y divide-border">
      {data.data.map((b) => (
        <li key={b._id} className="flex items-center justify-between p-4">
          <div>
            <div className="text-foreground font-medium">{b.name}</div>
            <div className="text-sm text-muted-foreground">{format(new Date(b.date), 'PPP')}</div>
          </div>
          <div className="flex gap-2">
            <EditBirthdayDialog birthday={b} />
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  await sendWish.mutateAsync(b._id);
                  toast({ title: 'Sent 🎉', description: `Wished ${b.name} a happy birthday` });
                } catch {
                  toast({ title: 'Error', description: 'Failed to send wish' });
                }
              }}
            >
              Send Wish
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await del.mutateAsync(b._id);
                  toast({ title: 'Deleted', description: `${b.name} removed` });
                } catch {
                  toast({ title: 'Error', description: 'Failed to delete' });
                }
              }}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
