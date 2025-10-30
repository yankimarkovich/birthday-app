import { z } from 'zod';

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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

//Extracts TypeScript type from Zod schema

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
