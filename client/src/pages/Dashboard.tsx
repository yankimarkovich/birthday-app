import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

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

      <main className="container mx-auto p-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2 text-foreground">Overview</h2>
          <p className="text-muted-foreground">
            Next steps: Upcoming birthdays with countdown timers, Calendar view, All list with CRUD.
          </p>
        </div>
      </main>
    </div>
  );
}
