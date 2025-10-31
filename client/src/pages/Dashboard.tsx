import { useAuth } from '@/context/useAuth';
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
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'upcoming' | 'calendar' | 'all'>('upcoming');

  return (
    <div className="min-h-screen bg-background">
      {/* Modern gradient header with better spacing */}
      <header className="border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">🎂 Birthday App</h1>
          <div className="flex items-center gap-4">
            <span className="text-base text-muted-foreground font-medium">{user?.name}</span>
            <Button variant="outline" size="default" onClick={logout} className="font-medium">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Modern toggle with better spacing */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-xl border-2 border-border bg-card p-1.5 shadow-sm">
            <Toggle value="upcoming" current={view} onChange={setView} label="Upcoming" />
            <Toggle value="calendar" current={view} onChange={setView} label="Calendar" />
            <Toggle value="all" current={view} onChange={setView} label="All" />
          </div>
          <AddBirthdayDialog />
        </div>

        {view === 'upcoming' && (
          <section className="space-y-4">
            <UpcomingList />
          </section>
        )}

        {view === 'calendar' && (
          <section className="space-y-4">
            <CalendarView />
          </section>
        )}

        {view === 'all' && (
          <section className="space-y-4">
            <BirthdayList />
          </section>
        )}
      </main>
    </div>
  );
}

function Toggle({
  value,
  current,
  onChange,
  label,
}: {
  value: 'upcoming' | 'calendar' | 'all';
  current: string;
  onChange: (v: 'upcoming' | 'calendar' | 'all') => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      className={`px-5 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary text-primary-foreground shadow-md scale-105'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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

  const enriched = data.data.map((b) => {
    const next = nextOccurrence(b.date);
    return { ...b, next, ms: next.getTime() - Date.now() };
  });

  const sorted = enriched.sort((a, b) => a.ms - b.ms).slice(0, 10);

  return (
    <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
      {sorted.map((b) => {
        const today = isToday(b.date);
        return (
          <li
            key={b._id}
            className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="text-foreground font-semibold text-lg">{b.name}</div>
                {today && (
                  <Badge
                    variant="default"
                    className="bg-accent text-accent-foreground text-sm px-3 py-1"
                  >
                    Today! 🎉
                  </Badge>
                )}
              </div>
              <div className="text-base text-muted-foreground mt-1">
                {format(new Date(b.date), 'MMM d')} • <Countdown target={b.next} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="default"
                size="default"
                disabled={!today}
                onClick={async () => {
                  try {
                    await sendWish.mutateAsync(b._id);
                    toast({ title: 'Sent 🎉', description: `Wished ${b.name} a happy birthday` });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to send wish' });
                  }
                }}
                className="font-medium"
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

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
  if (isError || !data)
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
  if (data.count === 0)
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-border rounded-xl p-12 text-center shadow-lg">
        <p className="text-lg text-muted-foreground font-medium">
          No birthdays yet. Add some to get started! 🎉
        </p>
      </div>
    );

  return (
    <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
      {data.data.map((b) => (
        <li
          key={b._id}
          className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
        >
          <div>
            <div className="text-foreground font-semibold text-lg">{b.name}</div>
            <div className="text-base text-muted-foreground mt-1">
              {format(new Date(b.date), 'PPP')}
            </div>
          </div>
          <div className="flex gap-3">
            <EditBirthdayDialog birthday={b} />
            <Button
              variant="default"
              size="default"
              onClick={async () => {
                try {
                  await sendWish.mutateAsync(b._id);
                  toast({ title: 'Sent 🎉', description: `Wished ${b.name} a happy birthday` });
                } catch {
                  toast({ title: 'Error', description: 'Failed to send wish' });
                }
              }}
              className="font-medium"
            >
              Send Wish
            </Button>
            <ConfirmDeleteDialog
              title="Delete"
              description={`Delete ${b.name}? This action cannot be undone.`}
              onConfirm={async () => {
                try {
                  await del.mutateAsync(b._id);
                  toast({ title: 'Deleted', description: `${b.name} removed` });
                } catch {
                  toast({ title: 'Error', description: 'Failed to delete' });
                }
              }}
            />
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

  // Source list for hooks to avoid conditional hook calls
  const source = React.useMemo(() => data?.data ?? [], [data]);

  // Map birthdays to date-key for quick lookup (month-day only, ignore year)
  const byDay = useMemo(() => {
    const map = new Map<string, typeof source>();
    for (const b of source) {
      const d = new Date(b.date);
      // Use only month and day for the key, so we can match across years
      const key = `${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [source]);

  const datesWithBirthdays = useMemo(() => {
    // normalize to the current year for highlight modifiers
    return source.map(
      (b) =>
        new Date(new Date().getFullYear(), new Date(b.date).getMonth(), new Date(b.date).getDate())
    );
  }, [source]);

  const countsByMonthDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of source) {
      const d = new Date(b.date);
      const key = `${d.getMonth()}-${d.getDate()}`;
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [source]);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError || !data)
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

  const modifiers = { hasBirthday: datesWithBirthdays } as const;

  const selectedList = (() => {
    if (!selected) return [] as typeof source;
    // Use only month and day for lookup (same as byDay map)
    const k = `${selected.getMonth()}-${selected.getDate()}`;
    return byDay.get(k) || [];
  })();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Compact calendar container with better proportions */}
      <div className="bg-card border-2 border-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            modifiers={modifiers}
            className="mx-auto"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-5',
              caption: 'flex justify-center pt-1 relative items-center mb-3',
              caption_label: 'text-xl font-bold text-foreground',
              nav: 'space-x-1 flex items-center',
              nav_button:
                'h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-md transition-all',
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse',
              head_row: 'flex',
              head_cell: 'text-muted-foreground rounded-md w-[60px] font-semibold text-base',
              row: 'flex w-full mt-2',
              cell: 'relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
              day: 'h-[60px] w-[60px] p-0 font-normal aria-selected:opacity-100 group/day data-[hasBirthday=true]:bg-primary/10 data-[hasBirthday=true]:text-primary data-[hasBirthday=true]:font-semibold',
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground font-bold',
              day_outside:
                'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
              day_disabled: 'text-muted-foreground opacity-50',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
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
                    className={`relative inline-flex h-[60px] w-[60px] items-center justify-center rounded-lg text-lg font-medium transition-all hover:bg-accent/50 hover:text-accent-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      (props.className as string) || ''
                    }`}
                  >
                    {/* Day number is rendered by DayPicker as children */}
                    {props.children}
                    {count === 1 && (
                      <span
                        className="absolute top-1.5 right-1.5 inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-sm"
                        aria-hidden
                      />
                    )}
                    {count > 1 && (
                      <span
                        className="absolute top-1 right-1 rounded-full bg-primary px-2 py-1 text-[11px] font-bold leading-none text-primary-foreground shadow-md"
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
        </div>
        <div className="text-sm text-muted-foreground px-6 pb-5 text-center font-medium border-t border-border pt-4 bg-muted/20">
          Days with birthdays are highlighted in purple 💜
        </div>
      </div>

      {/* Selected day details */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground">
            {selected ? format(selected, 'PPPP') : 'Select a day'}
          </h3>
        </div>

        {selectedList.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-xl p-8 text-center shadow-lg">
            <p className="text-base text-muted-foreground font-medium">
              No birthdays on this day 📅
            </p>
          </div>
        ) : (
          <ul className="bg-card border-2 border-border rounded-xl divide-y-2 divide-border shadow-lg overflow-hidden">
            {selectedList.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="text-foreground font-semibold text-lg">{b.name}</div>
                  <div className="text-base text-muted-foreground mt-1">
                    {format(new Date(b.date), 'PPP')}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    size="default"
                    disabled={!isToday(b.date)}
                    onClick={async () => {
                      try {
                        await sendWish.mutateAsync(b._id);
                        toast({
                          title: 'Sent 🎉',
                          description: `Wished ${b.name} a happy birthday`,
                        });
                      } catch {
                        toast({ title: 'Error', description: 'Failed to send wish' });
                      }
                    }}
                    className="font-medium"
                  >
                    Send Wish
                  </Button>
                  <ConfirmDeleteDialog
                    title="Delete"
                    description={`Delete ${b.name}? This action cannot be undone.`}
                    onConfirm={async () => {
                      try {
                        await del.mutateAsync(b._id);
                        toast({ title: 'Deleted', description: `${b.name} removed` });
                      } catch {
                        toast({ title: 'Error', description: 'Failed to delete' });
                      }
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
