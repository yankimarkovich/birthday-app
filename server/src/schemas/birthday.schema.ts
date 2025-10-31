import { z } from 'zod';

// ============================================================
// PARAMETER SCHEMAS (URL parameter validation)
// ============================================================

/**
 * MongoDB ObjectId Schema
 * Validates MongoDB ObjectId format (24 hex characters)
 * Used for :id parameter in GET/PATCH/DELETE routes
 */
export const mongoIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format')
    .trim(),
});

// ============================================================
// INPUT SCHEMAS (Request validation)
// ============================================================

/**
 * Create Birthday Schema
 * POST /api/birthdays
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
 * PATCH /api/birthdays/:id
 * Makes ALL fields optional only for the update
 */
export const updateBirthdaySchema = createBirthdaySchema.partial();

// ============================================================
// RESPONSE SCHEMAS (API response types)
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
 *
 * MATCHES YOUR CONTROLLER RESPONSE:
 * {
 *   success: true,
 *   count: 5,
 *   data: [...]
 * }
 */
export const birthdaysListResponseSchema = z.object({
  success: z.literal(true),
  count: z.number(),
  data: z.array(birthdaySchema),
});

/**
 * Single Birthday Response
 * GET /api/birthdays/:id
 * POST /api/birthdays (create)
 * PATCH /api/birthdays/:id (update)
 *
 * MATCHES YOUR CONTROLLER RESPONSE:
 * {
 *   success: true,
 *   data: {...}
 * }
 */
export const singleBirthdayResponseSchema = z.object({
  success: z.literal(true),
  data: birthdaySchema,
});

/**
 * Delete Birthday Response
 * DELETE /api/birthdays/:id
 *
 * MATCHES YOUR CONTROLLER RESPONSE:
 * {
 *   success: true,
 *   message: "Birthday deleted successfully"
 * }
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

// Parameter types
export type MongoIdParam = z.infer<typeof mongoIdSchema>;

// Input types
export type CreateBirthdayInput = z.infer<typeof createBirthdaySchema>;
export type UpdateBirthdayInput = z.infer<typeof updateBirthdaySchema>;

// Response types
export type Birthday = z.infer<typeof birthdaySchema>;
export type BirthdaysListResponse = z.infer<typeof birthdaysListResponseSchema>;
export type SingleBirthdayResponse = z.infer<typeof singleBirthdayResponseSchema>;
export type DeleteBirthdayResponse = z.infer<typeof deleteBirthdayResponseSchema>;
export type SendWishResponse = z.infer<typeof sendWishResponseSchema>;
