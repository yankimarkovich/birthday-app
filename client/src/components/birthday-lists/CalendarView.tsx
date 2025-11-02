import { useBirthdays } from '@/hooks/useBirthdays';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { DayButton } from 'react-day-picker';
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { BirthdayListItem } from './BirthdayListItem';
import type { Birthday } from '@/types';

interface CalendarViewProps {
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
}

export function CalendarView({ onEdit, onDelete }: CalendarViewProps) {
  const { data, isLoading, isError, refetch } = useBirthdays();
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const source = React.useMemo(() => data?.data ?? [], [data]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof source>();
    for (const b of source) {
      const d = new Date(b.date);
      const key = `${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [source]);

  const datesWithBirthdays = useMemo(() => {
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

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
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

  const modifiers = { hasBirthday: datesWithBirthdays } as const;

  const selectedList = (() => {
    if (!selected) return [] as typeof source;
    const k = `${selected.getMonth()}-${selected.getDate()}`;
    return byDay.get(k) || [];
  })();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      <div className="bg-card border-2 border-border rounded-xl shadow-lg overflow-hidden lg:sticky lg:top-8">
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
          <div className="bg-card border-2 border-border rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-[470px] overflow-y-auto">
              <ul className="divide-y-2 divide-border">
                {selectedList.map((b) => (
                  <BirthdayListItem key={b._id} birthday={b} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
