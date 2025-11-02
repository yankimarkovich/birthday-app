import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateBirthday } from '@/hooks/useBirthdays';
import { toast } from 'sonner';
import type { Birthday } from '@/types';
import { format } from 'date-fns';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  date: z.string().min(1, 'Date is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Max 500 chars').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

// NEW: Accept open, onOpenChange, and birthday as props
export default function EditBirthdayDialog({
  open,
  onOpenChange,
  birthday,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  birthday: Birthday;
}) {
  const updateBirthday = useUpdateBirthday();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        name: birthday.name,
        date: format(new Date(birthday.date), 'yyyy-MM-dd'),
        email: birthday.email || '',
        phone: birthday.phone || '',
        notes: birthday.notes || '',
      });
    }
  }, [open, birthday, reset]);

  const onSubmit = async (values: FormData) => {
    try {
      await updateBirthday.mutateAsync({ id: birthday._id, payload: values });
      toast.success(`Saved changes for ${values.name}`);
      onOpenChange(false); // Close via prop
    } catch {
      toast.error('Failed to update birthday');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* REMOVED: DialogTrigger - Dashboard will render the button */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Birthday</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Jane Doe" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" placeholder="+1 555 123 4567" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Favorite cake, gift ideas…"
              rows={3}
              {...register('notes')}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
