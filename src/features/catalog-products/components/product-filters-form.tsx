import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { productFiltersSchema, type ProductFiltersInput } from '../schemas/product-filters.schema';

type ProductFiltersFormProps = {
  defaultValues: ProductFiltersInput;
  onSubmit: (values: ProductFiltersInput) => void;
};

const sortOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'type', label: 'Tipo' },
  { value: 'basePrice', label: 'Precio base' },
  { value: 'cost', label: 'Costo' },
];

const dirOptions = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' },
];

export function ProductFiltersForm({ defaultValues, onSubmit }: ProductFiltersFormProps) {
  const { register, control, handleSubmit } = useForm<ProductFiltersInput>({
    resolver: zodResolver(productFiltersSchema),
    values: defaultValues,
  });

  return (
    <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Buscar" htmlFor="product-filter-q">
        <Input id="product-filter-q" placeholder="Nombre, tipo o notas" {...register('q')} />
      </FormField>

      <FormField label="Ordenar por">
        <Controller
          control={control}
          name="sort"
          render={({ field }) => <Select value={field.value} onChange={field.onChange} options={sortOptions} placeholder="Campo" />}
        />
      </FormField>

      <FormField label="Direccion">
        <Controller
          control={control}
          name="dir"
          render={({ field }) => <Select value={field.value} onChange={field.onChange} options={dirOptions} placeholder="Direccion" />}
        />
      </FormField>

      <div className="flex items-end">
        <Button className="w-full" type="submit">
          Aplicar filtros
        </Button>
      </div>
    </form>
  );
}
