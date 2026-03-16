import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { PermissionsEditor } from './permissions-editor';
import { userFormSchema, type UserFormInput } from '../schemas/user-form.schema';
import type { RolePermissionSetItem, SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem } from '../types/users.types';

type CreateUserFormProps = {
  roleOptions: Array<{ value: string; label: string }>;
  menus: SecurityMenuItem[];
  subMenus: SecuritySubMenuItem[];
  permissionsCatalog: SecurityPermissionItem[];
  permissionAssignments: RolePermissionSetItem[];
  onPermissionAssignmentsChange: (next: RolePermissionSetItem[]) => void;
  onRoleChange: (roleId: string) => void;
  onResetToRolePermissions: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: UserFormInput) => Promise<void>;
};

export function CreateUserForm({
  roleOptions,
  menus,
  subMenus,
  permissionsCatalog,
  permissionAssignments,
  onPermissionAssignmentsChange,
  onRoleChange,
  onResetToRolePermissions,
  isSubmitting,
  submitError,
  onSubmit,
}: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      fullName: '',
      password: '',
      roleId: '',
      email: '',
      phone: '',
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Username" htmlFor="user-username" error={errors.username?.message}>
        <Input id="user-username" placeholder="john.doe" {...register('username')} />
      </FormField>

      <FormField label="Full Name" htmlFor="user-fullname" error={errors.fullName?.message}>
        <Input id="user-fullname" placeholder="John Doe" {...register('fullName')} />
      </FormField>

      <FormField label="Email" htmlFor="user-email" error={errors.email?.message}>
        <Input id="user-email" type="email" placeholder="john@company.com" {...register('email')} />
      </FormField>

      <FormField label="Phone" htmlFor="user-phone" error={errors.phone?.message}>
        <Input id="user-phone" placeholder="+57 300 123 4567" {...register('phone')} />
      </FormField>

      <FormField label="Password" htmlFor="user-password" error={errors.password?.message}>
        <Input id="user-password" type="password" placeholder="••••••••" {...register('password')} />
      </FormField>

      <FormField label="Role" htmlFor="user-role" error={errors.roleId?.message}>
        <Controller
          control={control}
          name="roleId"
          render={({ field }) => (
            <Select
              value={field.value}
              onChange={(nextValue) => {
                field.onChange(nextValue);
                onRoleChange(nextValue);
              }}
              options={roleOptions}
              searchable
              searchPlaceholder="Search roles..."
              placeholder="Select a role"
            />
          )}
        />
      </FormField>

      <FormField
        label="Permissions"
        hint="Select permissions by menu/submenu. These values are required by the backend payload."
      >
        <div className="mb-2 flex justify-end">
          <Button type="button" variant="secondary" onClick={onResetToRolePermissions} disabled={isSubmitting}>
            Restore Role Permissions
          </Button>
        </div>
        <PermissionsEditor
          menus={menus}
          subMenus={subMenus}
          permissions={permissionsCatalog}
          value={permissionAssignments}
          onChange={onPermissionAssignmentsChange}
          disabled={isSubmitting}
        />
      </FormField>

      {submitError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating user...' : 'Create User'}
      </Button>
    </form>
  );
}
