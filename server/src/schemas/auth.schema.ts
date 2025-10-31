import { z } from 'zod';

// ============================================================
// INPUT SCHEMAS (Request validation)
// ============================================================

/**
 * User Registration Schema
 * POST /api/auth/register
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

/**
 * User Login Schema
 * POST /api/auth/login
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================
// RESPONSE SCHEMAS (API response types)
// ============================================================

/**
 * User Object Schema
 * Used in auth responses
 */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

/**
 * Auth Success Response Schema
 * Returned by /register and /login endpoints
 *
 * MATCHES YOUR CONTROLLER RESPONSE:
 * {
 *   success: true,
 *   token: "...",
 *   user: { id, name, email }
 * }
 */
export const authResponseSchema = z.object({
  success: z.literal(true),
  token: z.string(),
  user: userSchema,
});

/**
 * Error Response Schema
 * Standard error format for all endpoints
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string(),
      })
    )
    .optional(),
});

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

// Input types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Response types
export type UserResponse = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
