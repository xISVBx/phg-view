import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { getErrorMessage } from '../../../shared/lib/http';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Dialog } from '../../../shared/components/ui/dialog';
import { Table, TableShell } from '../../../shared/components/ui/table';
import { listMenusCatalog, listPermissionsCatalog, listSubMenusCatalog } from '../../security-users/api/security-catalog';
import type { SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem } from '../../security-users/types/users.types';
import { createRole, listRoles, setRolePermissions } from '../api/roles';
import { CreateRoleForm } from '../components/create-role-form';
import { RoleFiltersForm } from '../components/role-filters-form';
import { roleFiltersSchema, type RoleFiltersInput } from '../schemas/role-filters.schema';
import type { RoleItem, RolePermissionSetItem } from '../types/roles.types';

const initialFilters = roleFiltersSchema.parse({ q: '', sort: 'name', dir: 'asc' });

export function RolesPage() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoleFiltersInput>(initialFilters);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [menusCatalog, setMenusCatalog] = useState<SecurityMenuItem[]>([]);
  const [subMenusCatalog, setSubMenusCatalog] = useState<SecuritySubMenuItem[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<SecurityPermissionItem[]>([]);
  const [createPermissions, setCreatePermissions] = useState<RolePermissionSetItem[]>([]);

  const loadRoles = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await listRoles({ page: 1, pageSize: 25, ...filters });
      setItems(response.data ?? []);
      setTotal(response.meta?.total ?? 0);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load roles.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (!token) return;

    const loadCatalogs = async () => {
      const [menusResult, subMenusResult, permissionsResult] = await Promise.allSettled([
        listMenusCatalog(),
        listSubMenusCatalog(),
        listPermissionsCatalog(),
      ]);

      setMenusCatalog(menusResult.status === 'fulfilled' ? menusResult.value : []);
      setSubMenusCatalog(subMenusResult.status === 'fulfilled' ? subMenusResult.value : []);
      setPermissionsCatalog(permissionsResult.status === 'fulfilled' ? permissionsResult.value : []);
    };

    void loadCatalogs();
  }, [token]);

  return (
    <>
      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Security</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Roles</h1>
              <p className="mt-1 text-sm text-slate-600">Search, review and create roles.</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>New Role</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <RoleFiltersForm defaultValues={filters} onSubmit={setFilters} />

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {isLoading ? 'Loading roles...' : `Total roles: ${total}`}
          </div>

          <TableShell>
            <Table>
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((role) => (
                  <tr key={role.id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                    <td className="px-4 py-3">{role.description ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          role.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                      No roles found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </TableShell>
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        size="xl"
        title="Create Role"
        description="Define a new role for access control."
        onClose={() => {
          setIsCreateOpen(false);
          setCreateError(null);
          setCreatePermissions([]);
        }}
      >
        <CreateRoleForm
          menus={menusCatalog}
          subMenus={subMenusCatalog}
          permissionsCatalog={permissionsCatalog}
          permissionAssignments={createPermissions}
          onPermissionAssignmentsChange={setCreatePermissions}
          isSubmitting={isCreating}
          submitError={createError}
          onSubmit={async (values) => {
            if (!token) return;

            setIsCreating(true);
            setCreateError(null);
            try {
              const created = await createRole({
                name: values.name,
                description: values.description || undefined,
              });

              const roleId = created.data?.id;
              if (roleId) {
                await setRolePermissions(roleId, createPermissions);
              }

              setIsCreateOpen(false);
              setCreatePermissions([]);
              await loadRoles();
            } catch (createErr) {
              setCreateError(getErrorMessage(createErr, 'Failed to create role.'));
            } finally {
              setIsCreating(false);
            }
          }}
        />
      </Dialog>
    </>
  );
}
