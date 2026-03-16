import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { userFiltersSchema, type UserFiltersInput } from '../schemas/user-filters.schema';

type UserFiltersFormProps = {
  defaultValues: UserFiltersInput;
  onSubmit: (values: UserFiltersInput) => void;
};

export function UserFiltersForm({ defaultValues, onSubmit }: UserFiltersFormProps) {
  const { register, handleSubmit, reset, control } = useForm<UserFiltersInput>({
    resolver: zodResolver(userFiltersSchema),
    defaultValues,
  });

  return (
    <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Search" htmlFor="users-q">
        <Input id="users-q" placeholder="Search users..." {...register('q')} />
      </FormField>

      <FormField label="Sort" htmlFor="users-sort">
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
                { value: 'username', label: 'Username' },
                { value: 'fullName', label: 'Full Name' },
                { value: 'email', label: 'Email' },
              ]}
            />
          )}
        />
      </FormField>

      <FormField label="Direction" htmlFor="users-dir">
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
            const resetValues: UserFiltersInput = { q: '', sort: 'username', dir: 'asc' };
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
