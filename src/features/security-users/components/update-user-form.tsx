import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { Select } from '../../../shared/components/ui/select';
import { PermissionsEditor } from './permissions-editor';
import type { RolePermissionSetItem, SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem, UserItem } from '../types/users.types';
import { userUpdateSchema, type UserUpdateInput } from '../schemas/user-update.schema';

type UpdateUserFormProps = {
  user: UserItem;
  roleOptions: Array<{ value: string; label: string }>;
  initialRoleId?: string;
  menus: SecurityMenuItem[];
  subMenus: SecuritySubMenuItem[];
  permissionsCatalog: SecurityPermissionItem[];
  permissionAssignments: RolePermissionSetItem[];
  onPermissionAssignmentsChange: (next: RolePermissionSetItem[]) => void;
  onRoleChange: (roleId: string) => void;
  onResetToRolePermissions: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: UserUpdateInput) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
};

export function UpdateUserForm({
  user,
  roleOptions,
  initialRoleId,
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
  onCancel,
  readOnly = false,
}: UpdateUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullName: user.fullName ?? '',
      roleId: initialRoleId ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      isActive: user.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      fullName: user.fullName ?? '',
      roleId: initialRoleId ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      isActive: user.isActive ?? true,
    });
  }, [initialRoleId, reset, user]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Username" htmlFor="edit-username" hint="Username cannot be changed here.">
        <Input id="edit-username" value={user.username} disabled readOnly />
      </FormField>

      <FormField label="Full Name" htmlFor="edit-fullname" error={errors.fullName?.message}>
        <Input id="edit-fullname" placeholder="John Doe" disabled={readOnly || isSubmitting} {...register('fullName')} />
      </FormField>

      <FormField label="Role" htmlFor="edit-role" error={errors.roleId?.message}>
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
              disabled={readOnly || isSubmitting}
            />
          )}
        />
      </FormField>

      <FormField
        label="Permissions"
        hint="Edit effective permission assignments grouped by menu/submenu."
      >
        {!readOnly ? (
          <div className="mb-2 flex justify-end">
            <Button type="button" variant="secondary" onClick={onResetToRolePermissions} disabled={isSubmitting}>
              Restore Role Permissions
            </Button>
          </div>
        ) : null}
        <PermissionsEditor
          menus={menus}
          subMenus={subMenus}
          permissions={permissionsCatalog}
          value={permissionAssignments}
          onChange={onPermissionAssignmentsChange}
          disabled={readOnly || isSubmitting}
        />
      </FormField>

      <FormField label="Email" htmlFor="edit-email" error={errors.email?.message}>
        <Input id="edit-email" type="email" placeholder="john@company.com" disabled={readOnly || isSubmitting} {...register('email')} />
      </FormField>

      <FormField label="Phone" htmlFor="edit-phone" error={errors.phone?.message}>
        <Input id="edit-phone" placeholder="+57 300 123 4567" disabled={readOnly || isSubmitting} {...register('phone')} />
      </FormField>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            label="User is active"
            description="Turn off to disable login access for this user."
            disabled={readOnly || isSubmitting}
          />
        )}
      />

      {submitError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}

      {!readOnly ? (
        <div className="flex gap-2">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving changes...' : 'Save Changes'}
          </Button>
          <Button className="w-full" variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      ) : null}
    </form>
  );
}
