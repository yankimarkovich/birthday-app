import { z } from 'zod';

export const createBirthdaySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
});

//Makes ALL fields optional only for the update
export const updateBirthdaySchema = createBirthdaySchema.partial();
//Extracts TypeScript type from Zod schema
export type CreateBirthdayInput = z.infer<typeof createBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof updateBirthdaySchema>;
