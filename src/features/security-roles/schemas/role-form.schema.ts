import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z.string().trim().min(2, 'Role name must contain at least 2 characters.'),
  description: z.string().trim().optional().or(z.literal('')),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;
