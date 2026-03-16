import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { productFormSchema, type ProductFormInput } from '../schemas/product-form.schema';
import type { ProductCategoryItem } from '../types/products.types';

type ProductFormProps = {
  categories: ProductCategoryItem[];
  defaultValues?: Partial<ProductFormInput>;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: ProductFormInput) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
};

function normalizeNumber(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

export function ProductForm({ categories, defaultValues, isSubmitting, submitError, onSubmit, onCancel, readOnly = false }: ProductFormProps) {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
    description: category.description,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    values: {
      categoryId: defaultValues?.categoryId ?? '',
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? '',
      notes: defaultValues?.notes ?? '',
      commissionType: defaultValues?.commissionType ?? '',
      cost: defaultValues?.cost,
      basePrice: defaultValues?.basePrice,
      commissionValue: defaultValues?.commissionValue,
      defaultLeadDays: defaultValues?.defaultLeadDays,
      requiresDelivery: defaultValues?.requiresDelivery ?? false,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        const normalizedValues: ProductFormInput = {
          ...values,
          cost: normalizeNumber(values.cost),
          basePrice: normalizeNumber(values.basePrice),
          commissionValue: normalizeNumber(values.commissionValue),
          defaultLeadDays: normalizeNumber(values.defaultLeadDays),
        };

        await onSubmit(normalizedValues);
      })}
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Categoria" error={errors.categoryId?.message}>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={categoryOptions}
                placeholder="Selecciona una categoria"
                searchable
                searchPlaceholder="Buscar categoria..."
                disabled={readOnly || isSubmitting}
              />
            )}
          />
        </FormField>

        <FormField label="Nombre" htmlFor="product-name" error={errors.name?.message}>
          <Input id="product-name" placeholder="Album premium" disabled={readOnly || isSubmitting} {...register('name')} />
        </FormField>

        <FormField label="Tipo" htmlFor="product-type" error={errors.type?.message} hint="El API lo maneja como texto libre.">
          <Input id="product-type" placeholder="producto, servicio, paquete..." disabled={readOnly || isSubmitting} {...register('type')} />
        </FormField>

        <FormField label="Tipo de comision" htmlFor="product-commission-type" error={errors.commissionType?.message}>
          <Input id="product-commission-type" placeholder="fixed o percent" disabled={readOnly || isSubmitting} {...register('commissionType')} />
        </FormField>

        <FormField label="Costo" htmlFor="product-cost" error={errors.cost?.message}>
          <Input
            id="product-cost"
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled={readOnly || isSubmitting}
            {...register('cost', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Precio base" htmlFor="product-base-price" error={errors.basePrice?.message}>
          <Input
            id="product-base-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled={readOnly || isSubmitting}
            {...register('basePrice', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Valor de comision" htmlFor="product-commission-value" error={errors.commissionValue?.message}>
          <Input
            id="product-commission-value"
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled={readOnly || isSubmitting}
            {...register('commissionValue', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Dias de entrega" htmlFor="product-lead-days" error={errors.defaultLeadDays?.message}>
          <Input
            id="product-lead-days"
            type="number"
            step="1"
            placeholder="0"
            disabled={readOnly || isSubmitting}
            {...register('defaultLeadDays', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Notas" htmlFor="product-notes" error={errors.notes?.message}>
        <textarea
          id="product-notes"
          rows={4}
          placeholder="Observaciones operativas o comerciales"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          disabled={readOnly || isSubmitting}
          {...register('notes')}
        />
      </FormField>

      <Controller
        control={control}
        name="requiresDelivery"
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            label="Requiere entrega"
            description="Marca este producto si necesita tiempos o logistica de entrega."
            disabled={readOnly || isSubmitting}
          />
        )}
      />

      {submitError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}

      {!readOnly ? (
        <div className="flex justify-end gap-3">
          {onCancel ? (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar producto'}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
