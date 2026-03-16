import { z } from 'zod';

const optionalText = z.string().trim().optional().or(z.literal(''));
const optionalNumber = z.union([z.number(), z.nan()]).optional();

export const productFormSchema = z.object({
  categoryId: z.string().trim().min(1, 'La categoria es obligatoria.'),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  type: z.string().trim().min(1, 'El tipo es obligatorio.'),
  notes: optionalText,
  commissionType: optionalText,
  cost: optionalNumber,
  basePrice: optionalNumber,
  commissionValue: optionalNumber,
  defaultLeadDays: optionalNumber,
  requiresDelivery: z.boolean(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
