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
import { Calendar } from '@/components/ui/calendar';
import { DayButton } from 'react-day-picker';
import React from 'react';
import { useMemo, useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'upcoming' | 'calendar' | 'all'>('upcoming');

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
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border border-border bg-card p-1">
            <Toggle value="upcoming" current={view} onChange={setView} label="Upcoming" />
            <Toggle value="calendar" current={view} onChange={setView} label="Calendar" />
            <Toggle value="all" current={view} onChange={setView} label="All" />
          </div>
          <AddBirthdayDialog />
        </div>

        {view === 'upcoming' && (
          <section className="space-y-3">
            <UpcomingList />
          </section>
        )}

        {view === 'calendar' && (
          <section className="space-y-3">
            <CalendarView />
          </section>
        )}

        {view === 'all' && (
          <section className="space-y-3">
            <BirthdayList />
          </section>
        )}
      </main>
    </div>
  );
}

function Toggle({ value, current, onChange, label }: { value: 'upcoming' | 'calendar' | 'all'; current: string; onChange: (v: any) => void; label: string }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
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

function CalendarView() {
  const { data, isLoading, isError, refetch } = useBirthdays();
  const { toast } = useToast();
  const sendWish = useSendWish();
  const del = useDeleteBirthday();
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data)
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-red-500">
        Failed to load. <button className="underline" onClick={() => refetch()}>Retry</button>
      </div>
    );

  // Map birthdays to date-key for quick lookup
  const byDay = useMemo(() => {
    const map = new Map<string, typeof data.data>();
    for (const b of data.data) {
      const d = new Date(b.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [data.data]);

  const datesWithBirthdays = useMemo(() => {
    // normalize to the current year for highlight modifiers
    return data.data.map((b) => new Date(new Date().getFullYear(), new Date(b.date).getMonth(), new Date(b.date).getDate()));
  }, [data.data]);

  const countsByMonthDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of data.data) {
      const d = new Date(b.date);
      const key = `${d.getMonth()}-${d.getDate()}`;
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [data.data]);

  const modifiers = { hasBirthday: datesWithBirthdays } as const;

  const selectedList = (() => {
    if (!selected) return [] as typeof data.data;
    const k = `${selected.getFullYear()}-${selected.getMonth()}-${selected.getDate()}`;
    return byDay.get(k) || [];
  })();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="bg-card border border-border rounded-lg p-3">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={modifiers}
          classNames={{
            day: 'group/day data-[hasBirthday=true]:bg-secondary/40',
          }}
          components={{
            DayButton: (props: React.ComponentProps<typeof DayButton>) => {
              const d = props.day.date;
              const key = `${d.getMonth()}-${d.getDate()}`;
              const count = countsByMonthDay.get(key) || 0;
              const displayCount = count > 9 ? '9+' : String(count);
              return (
                <button
                  {...props}
                  className={`relative flex aspect-square h-auto w-full min-w-[--cell-size] items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none ${
                    (props.className as string) || ''
                  }`}
                >
                  {/* Day number is rendered by DayPicker as children */}
                  {props.children}
                  {count === 1 && (
                    <span
                      className="absolute top-1 right-1 inline-block h-1.5 w-1.5 rounded-full bg-primary/90"
                      aria-hidden
                    />
                  )}
                  {count > 1 && (
                    <span
                      className="absolute top-1 right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground shadow-sm"
                      aria-label={`${count} birthdays`}
                    >
                      {displayCount}
                    </span>
                  )}
                </button>
              );
            },
          }}
        />
        <div className="text-xs text-muted-foreground mt-2">Days with birthdays are subtly highlighted.</div>
      </div>

      <div className="space-y-3">
        <h3 className="text-md font-medium text-foreground">{selected ? format(selected, 'PPP') : 'Select a day'}</h3>
        {selectedList.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">No birthdays on this day.</div>
        ) : (
          <ul className="bg-card border border-border rounded-lg divide-y divide-border">
            {selectedList.map((b) => (
              <li key={b._id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-foreground font-medium">{b.name}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(b.date), 'PPP')}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!isToday(b.date)}
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
        )}
      </div>
    </div>
  );
}
