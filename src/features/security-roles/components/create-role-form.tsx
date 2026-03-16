import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { PermissionsEditor } from '../../security-users/components/permissions-editor';
import { roleFormSchema, type RoleFormInput } from '../schemas/role-form.schema';
import type { RolePermissionSetItem } from '../types/roles.types';
import type { SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem } from '../../security-users/types/users.types';

type CreateRoleFormProps = {
  menus: SecurityMenuItem[];
  subMenus: SecuritySubMenuItem[];
  permissionsCatalog: SecurityPermissionItem[];
  permissionAssignments: RolePermissionSetItem[];
  onPermissionAssignmentsChange: (next: RolePermissionSetItem[]) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: RoleFormInput) => Promise<void>;
};

export function CreateRoleForm({
  menus,
  subMenus,
  permissionsCatalog,
  permissionAssignments,
  onPermissionAssignmentsChange,
  isSubmitting,
  submitError,
  onSubmit,
}: CreateRoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormInput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Role Name" htmlFor="role-name" error={errors.name?.message}>
        <Input id="role-name" placeholder="Administrator" {...register('name')} />
      </FormField>

      <FormField label="Description" htmlFor="role-description" error={errors.description?.message}>
        <Input id="role-description" placeholder="Full administrative access" {...register('description')} />
      </FormField>

      <FormField
        label="Permissions"
        hint="Assign role permissions by menu/submenu. These items are sent after role creation."
      >
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
        {isSubmitting ? 'Creating role...' : 'Create Role'}
      </Button>
    </form>
  );
}
