import { z } from 'zod';

export const userUpdateSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must contain at least 3 characters.'),
  roleId: z.string().trim().min(1, 'Role is required.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
