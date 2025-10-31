import { Button } from '@/components/ui/button';

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">🎂 Birthday App</h1>
          <p className="text-muted-foreground mb-6">
            shadcn/ui is working! These are actual Button components:
          </p>

          <div className="space-y-4">
            {/* Default variant */}
            <Button className="w-full" variant="default">
              Default Button
            </Button>

            {/* Secondary variant */}
            <Button className="w-full" variant="secondary">
              Secondary Button
            </Button>

            {/* Destructive variant */}
            <Button className="w-full" variant="destructive">
              Delete Button
            </Button>

            {/* Outline variant */}
            <Button className="w-full" variant="outline">
              Outline Button
            </Button>

            {/* Ghost variant */}
            <Button className="w-full" variant="ghost">
              Ghost Button
            </Button>

            {/* Different sizes */}
            <div className="flex gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>

            {/* With icon (using emoji for now) */}
            <Button className="w-full">🎉 Send Birthday Wish</Button>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          ✅ If you see different button styles, shadcn/ui is working!
        </p>
      </div>
    </div>
  );
}

export default App;
