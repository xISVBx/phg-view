import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Email or username is required.')
    .min(3, 'Email or username must contain at least 3 characters.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(6, 'Password must contain at least 6 characters.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
