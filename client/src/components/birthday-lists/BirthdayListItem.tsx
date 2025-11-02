import { Button } from '@/components/ui/button';
import { useSendWish } from '@/hooks/useBirthdays';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { wasWishSentThisYear } from '@/lib/date';
import type { Birthday } from '@/types';
import type { ReactNode } from 'react';

interface BirthdayListItemProps {
  birthday: Birthday;
  onEdit: (birthday: Birthday) => void;
  onDelete: (birthday: Birthday) => void;
  badge?: ReactNode;
  dateInfo?: ReactNode;
  dateFormat?: string;
}

export function BirthdayListItem({
  birthday,
  onEdit,
  onDelete,
  badge,
  dateInfo,
  dateFormat = 'PPP',
}: BirthdayListItemProps) {
  const sendWish = useSendWish();
  const alreadySent = wasWishSentThisYear(birthday.lastWishSent);

  return (
    <li className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
      <div>
        <div className="flex items-center gap-3">
          <div className="text-foreground font-semibold text-lg">{birthday.name}</div>
          {badge}
        </div>
        <div className="text-base text-muted-foreground mt-1">
          {dateInfo || format(new Date(birthday.date), dateFormat)}
          {alreadySent && birthday.lastWishSent && (
            <span className="ml-2 text-xs text-muted-foreground">
              • Wished on {format(new Date(birthday.lastWishSent), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="default"
          onClick={() => onEdit(birthday)}
          className="font-medium"
        >
          Edit
        </Button>
        <Button
          variant={alreadySent ? 'secondary' : 'default'}
          size="default"
          disabled={alreadySent || sendWish.isPending}
          onClick={async () => {
            try {
              await sendWish.mutateAsync(birthday._id);
              toast.success(`Wished ${birthday.name} a happy birthday 🎉`);
            } catch (error) {
              const errorMsg =
                (error as { response?: { data?: { error?: string } } })?.response?.data
                  ?.error || 'Failed to send wish';
              toast.error(errorMsg);
            }
          }}
          className={`font-medium ${alreadySent ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {alreadySent ? 'Wish Sent ✓' : 'Send Wish'}
        </Button>
        <Button
          variant="destructive"
          size="default"
          onClick={() => onDelete(birthday)}
          className="font-medium"
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
