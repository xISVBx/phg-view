import { z } from 'zod';

export const userFiltersSchema = z.object({
  q: z.string().trim(),
  sort: z.enum(['username', 'fullName', 'email']),
  dir: z.enum(['asc', 'desc']),
});

export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
