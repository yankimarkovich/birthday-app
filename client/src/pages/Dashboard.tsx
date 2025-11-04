import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
      <Card className="rounded-none border-x-0 border-t-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <CardHeader className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">🎂 Birthday App</h1>
            <div className="flex items-center gap-4">
              <span className="text-base text-muted-foreground font-medium">{user?.name}</span>
              <Button variant="outline" size="default" onClick={logout} className="font-medium">
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value) setView(value as 'today' | 'month' | 'calendar' | 'all');
            }}
            className="inline-flex items-center rounded-xl border-2 border-border bg-card p-1.5 shadow-sm"
          >
            <ToggleGroupItem value="today" className="px-5 py-2.5 text-base font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md data-[state=on]:scale-105">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-5 py-2.5 text-base font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md data-[state=on]:scale-105">
              This Month
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" className="px-5 py-2.5 text-base font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md data-[state=on]:scale-105">
              Calendar
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className="px-5 py-2.5 text-base font-medium rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md data-[state=on]:scale-105">
              All
            </ToggleGroupItem>
          </ToggleGroup>
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
