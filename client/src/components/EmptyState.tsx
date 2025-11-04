import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-12 text-center">
        <p className="text-lg text-muted-foreground font-medium">{message}</p>
      </CardContent>
    </Card>
  );
}
