import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { useDeleteBirthday } from '@/hooks/useBirthdays';
import { toast } from 'sonner';
import { useState } from 'react';
import AddBirthdayDialog from '@/components/AddBirthdayDialog';
import EditBirthdayDialog from '@/components/EditBirthdayDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { TodayList } from '@/components/birthday-lists/TodayList';
import { ThisMonthList } from '@/components/birthday-lists/ThisMonthList';
import { BirthdayList } from '@/components/birthday-lists/BirthdayList';
import { CalendarView } from '@/components/birthday-lists/CalendarView';
import type { Birthday } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'today' | 'month' | 'calendar' | 'all'>('today');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const del = useDeleteBirthday();

  return (
    <div className="min-h-screen bg-background">
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
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-xl border-2 border-border bg-card p-1.5 shadow-sm">
            <Toggle value="today" current={view} onChange={setView} label="Today" />
            <Toggle value="month" current={view} onChange={setView} label="This Month" />
            <Toggle value="calendar" current={view} onChange={setView} label="Calendar" />
            <Toggle value="all" current={view} onChange={setView} label="All" />
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="font-medium" size="default">
            Add Birthday
          </Button>
        </div>

        {view === 'today' && (
          <section className="space-y-4">
            <TodayList
              onEdit={(birthday) => {
                setSelectedBirthday(birthday);
                setEditDialogOpen(true);
              }}
              onDelete={(birthday) => {
                setSelectedBirthday(birthday);
                setDeleteDialogOpen(true);
              }}
            />
          </section>
        )}

        {view === 'month' && (
          <section className="space-y-4">
            <ThisMonthList
              onEdit={(birthday) => {
                setSelectedBirthday(birthday);
                setEditDialogOpen(true);
              }}
              onDelete={(birthday) => {
                setSelectedBirthday(birthday);
                setDeleteDialogOpen(true);
              }}
            />
          </section>
        )}

        {view === 'calendar' && (
          <section className="space-y-4">
            <CalendarView
              onEdit={(birthday) => {
                setSelectedBirthday(birthday);
                setEditDialogOpen(true);
              }}
              onDelete={(birthday) => {
                setSelectedBirthday(birthday);
                setDeleteDialogOpen(true);
              }}
            />
          </section>
        )}

        {view === 'all' && (
          <section className="space-y-4">
            <BirthdayList
              onEdit={(birthday) => {
                setSelectedBirthday(birthday);
                setEditDialogOpen(true);
              }}
              onDelete={(birthday) => {
                setSelectedBirthday(birthday);
                setDeleteDialogOpen(true);
              }}
            />
          </section>
        )}
      </main>

      <AddBirthdayDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {selectedBirthday && (
        <>
          <EditBirthdayDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            birthday={selectedBirthday}
          />
          <ConfirmDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Birthday"
            description={`Delete ${selectedBirthday.name}? This action cannot be undone.`}
            onConfirm={async () => {
              try {
                await del.mutateAsync(selectedBirthday._id);
                toast.success(`${selectedBirthday.name} removed`);
              } catch {
                toast.error('Failed to delete');
              }
            }}
          />
        </>
      )}
    </div>
  );
}

function Toggle({
  value,
  current,
  onChange,
  label,
}: {
  value: 'today' | 'month' | 'calendar' | 'all';
  current: string;
  onChange: (v: 'today' | 'month' | 'calendar' | 'all') => void;
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
