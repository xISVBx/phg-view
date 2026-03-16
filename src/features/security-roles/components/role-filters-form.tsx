import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { roleFiltersSchema, type RoleFiltersInput } from '../schemas/role-filters.schema';

type RoleFiltersFormProps = {
  defaultValues: RoleFiltersInput;
  onSubmit: (values: RoleFiltersInput) => void;
};

export function RoleFiltersForm({ defaultValues, onSubmit }: RoleFiltersFormProps) {
  const { register, handleSubmit, reset, control } = useForm<RoleFiltersInput>({
    resolver: zodResolver(roleFiltersSchema),
    defaultValues,
  });

  return (
    <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Search" htmlFor="roles-q">
        <Input id="roles-q" placeholder="Search roles..." {...register('q')} />
      </FormField>

      <FormField label="Sort" htmlFor="roles-sort">
        <Controller
          control={control}
          name="sort"
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              searchable
              searchPlaceholder="Find sort field..."
              options={[
                { value: 'name', label: 'Name' },
                { value: 'createdAtUtc', label: 'Created' },
              ]}
            />
          )}
        />
      </FormField>

      <FormField label="Direction" htmlFor="roles-dir">
        <Controller
          control={control}
          name="dir"
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
            />
          )}
        />
      </FormField>

      <div className="flex items-end gap-2">
        <Button className="w-full" type="submit">
          Apply
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            const resetValues: RoleFiltersInput = { q: '', sort: 'name', dir: 'asc' };
            reset(resetValues);
            onSubmit(resetValues);
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
