import { z } from 'zod';

// ============================================================
// INPUT SCHEMAS (Request validation)
// ============================================================

/**
 * Create Birthday Schema
 */
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

/**
 * Update Birthday Schema
 * Makes ALL fields optional only for the update
 */
export const updateBirthdaySchema = createBirthdaySchema.partial();

// ============================================================
// RESPONSE SCHEMAS (API response validation & types)
// ============================================================

/**
 * Birthday Object Schema
 * Single birthday as returned from database
 */
export const birthdaySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  date: z.date().or(z.string()), // Can be Date or ISO string
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Get All Birthdays Response
 * GET /api/birthdays
 */
export const birthdaysListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(birthdaySchema),
  count: z.number(),
});

/**
 * Get Single Birthday Response
 * GET /api/birthdays/:id
 * POST /api/birthdays (create)
 * PATCH /api/birthdays/:id (update)
 */
export const singleBirthdayResponseSchema = z.object({
  success: z.literal(true),
  data: birthdaySchema,
});

/**
 * Delete Birthday Response
 * DELETE /api/birthdays/:id
 */
export const deleteBirthdayResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/**
 * Send Birthday Wish Response
 * POST /api/birthdays/:id/wish
 */
export const sendWishResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

// Input types
export type CreateBirthdayInput = z.infer<typeof createBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof updateBirthdaySchema>;

// Response types
export type Birthday = z.infer<typeof birthdaySchema>;
export type BirthdaysListResponse = z.infer<typeof birthdaysListResponseSchema>;
export type SingleBirthdayResponse = z.infer<typeof singleBirthdayResponseSchema>;
export type DeleteBirthdayResponse = z.infer<typeof deleteBirthdayResponseSchema>;
export type SendWishResponse = z.infer<typeof sendWishResponseSchema>;
