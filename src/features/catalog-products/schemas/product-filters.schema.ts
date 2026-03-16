import { z } from 'zod';

export const productFiltersSchema = z.object({
  q: z.string().trim(),
  sort: z.enum(['name', 'type', 'basePrice', 'cost']),
  dir: z.enum(['asc', 'desc']),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
