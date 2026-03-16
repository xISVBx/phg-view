import { z } from 'zod';

export const userFormSchema = z.object({
  username: z.string().trim().min(3, 'Username must contain at least 3 characters.'),
  fullName: z.string().trim().min(3, 'Full name must contain at least 3 characters.'),
  password: z.string().min(6, 'Password must contain at least 6 characters.'),
  roleId: z.string().trim().min(1, 'Role is required.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
