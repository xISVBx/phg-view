import { z } from 'zod';

export const roleFiltersSchema = z.object({
  q: z.string().trim(),
  sort: z.enum(['name', 'createdAtUtc']),
  dir: z.enum(['asc', 'desc']),
});

export type RoleFiltersInput = z.infer<typeof roleFiltersSchema>;
