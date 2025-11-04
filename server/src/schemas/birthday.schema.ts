import { z } from 'zod';

export const mongoIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format')
    .trim(),
});

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

export const updateBirthdaySchema = createBirthdaySchema.partial();

export const birthdaySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  date: z.date().or(z.string()),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  lastWishSent: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const birthdaysListResponseSchema = z.object({
  success: z.literal(true),
  count: z.number(),
  data: z.array(birthdaySchema),
});

export const singleBirthdayResponseSchema = z.object({
  success: z.literal(true),
  data: birthdaySchema,
});

export const deleteBirthdayResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export const sendWishResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  sentAt: z.date().or(z.string()),
});

export const sendWishDuplicateErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  lastSent: z.date().or(z.string()),
});

// TYPESCRIPT TYPES Generated from Zod Schema

export type MongoIdParam = z.infer<typeof mongoIdSchema>;
export type CreateBirthdayInput = z.infer<typeof createBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof updateBirthdaySchema>;
export type Birthday = z.infer<typeof birthdaySchema>;
export type BirthdaysListResponse = z.infer<typeof birthdaysListResponseSchema>;
export type SingleBirthdayResponse = z.infer<typeof singleBirthdayResponseSchema>;
export type DeleteBirthdayResponse = z.infer<typeof deleteBirthdayResponseSchema>;
export type SendWishResponse = z.infer<typeof sendWishResponseSchema>;
export type SendWishDuplicateError = z.infer<typeof sendWishDuplicateErrorSchema>;
