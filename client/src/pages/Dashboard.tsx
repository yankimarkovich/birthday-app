import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useBirthdays, useSendWish, useDeleteBirthday } from '@/hooks/useBirthdays';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

      <main className="container mx-auto p-4 space-y-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-medium text-foreground">All Birthdays</h2>
        </div>

        <BirthdayList />
      </main>
    </div>
  );
}

function BirthdayList() {
  const { toast } = useToast();
  const { data, isLoading, isError } = useBirthdays();
  const sendWish = useSendWish();
  const del = useDeleteBirthday();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">Loading…</div>
    );
  }
  if (isError || !data) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-red-500">Failed to load birthdays</div>
    );
  }

  if (data.count === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">
        No birthdays yet. Add some to get started.
      </div>
    );
  }

  return (
    <ul className="bg-card border border-border rounded-lg divide-y divide-border">
      {data.data.map((b) => (
        <li key={b._id} className="flex items-center justify-between p-4">
          <div>
            <div className="text-foreground font-medium">{b.name}</div>
            <div className="text-sm text-muted-foreground">{format(new Date(b.date), 'PPP')}</div>
          </div>
          <div className="flex gap-2">
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
