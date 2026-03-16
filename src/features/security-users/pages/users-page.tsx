import { useCallback, useEffect, useState } from 'react';
import { getRolePermissions, listRoles } from '../../security-roles/api/roles';
import { useAuthStore } from '../../auth/store/auth.store';
import { getErrorMessage } from '../../../shared/lib/http';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Dialog } from '../../../shared/components/ui/dialog';
import { Table, TableShell } from '../../../shared/components/ui/table';
import { createUser, getUser, getUserRoles, listUsers, updateUser } from '../api/users';
import { listMenusCatalog, listPermissionsCatalog, listSubMenusCatalog } from '../api/security-catalog';
import { CreateUserForm } from '../components/create-user-form';
import { UpdateUserForm } from '../components/update-user-form';
import { userFiltersSchema, type UserFiltersInput } from '../schemas/user-filters.schema';
import type {
  RolePermissionSetItem,
  SecurityMenuItem,
  SecurityPermissionItem,
  SecuritySubMenuItem,
  UserItem,
  UserRoleDetail,
} from '../types/users.types';
import { UserFiltersForm } from '../components/user-filters-form';

const initialFilters = userFiltersSchema.parse({ q: '', sort: 'username', dir: 'asc' });

type UserRoleReference = {
  roleID?: string;
  roleId?: string;
  RoleID?: string;
  RoleId?: string;
  isPrimary?: boolean;
};

type ResolvedUserRoleState = {
  baseRoleId: string;
  permissionsRoleId: string;
  hasCustomPermissions: boolean;
};

function buildAssignmentsFromRolePermissions(
  rolePermissions: Array<{
    subMenuID?: string;
    subMenuId?: string;
    SubMenuID?: string;
    permissionID?: string;
    permissionId?: string;
    PermissionID?: string;
  }>,
  subMenus: SecuritySubMenuItem[],
): RolePermissionSetItem[] {
  // La API devuelve permisos como filas sueltas.
  // El editor necesita una estructura agrupada por submenu y enlazada al menu padre.
  const grouped = new Map<string, Set<string>>();

  for (const item of rolePermissions) {
    const subMenuId =
      (typeof item.subMenuID === 'string' ? item.subMenuID : undefined) ??
      (typeof item.subMenuId === 'string' ? item.subMenuId : undefined) ??
      (typeof item.SubMenuID === 'string' ? item.SubMenuID : undefined);

    const permissionId =
      (typeof item.permissionID === 'string' ? item.permissionID : undefined) ??
      (typeof item.permissionId === 'string' ? item.permissionId : undefined) ??
      (typeof item.PermissionID === 'string' ? item.PermissionID : undefined);

    if (!subMenuId || !permissionId) continue;

    if (!grouped.has(subMenuId)) grouped.set(subMenuId, new Set());
    grouped.get(subMenuId)?.add(permissionId);
  }

  return Array.from(grouped.entries())
    .map(([subMenuId, permissionSet]) => {
      const subMenu = subMenus.find((s) => s.id === subMenuId);
      if (!subMenu?.menuId) return null;

      return {
        menuId: subMenu.menuId,
        subMenuId,
        permissionIds: Array.from(permissionSet),
      };
    })
    .filter((item): item is RolePermissionSetItem => Boolean(item));
}

function cloneAssignments(assignments: RolePermissionSetItem[]): RolePermissionSetItem[] {
  return assignments.map((item) => ({
    menuId: item.menuId,
    subMenuId: item.subMenuId,
    permissionIds: [...item.permissionIds],
  }));
}

function buildAssignmentsFromRoleTree(role: UserRoleDetail | undefined): RolePermissionSetItem[] {
  if (!role) return [];

  // Cuando el detalle del usuario ya trae el arbol menu > submenu > permisos,
  // lo reutilizamos para no depender de otra consulta adicional.
  const assignments: RolePermissionSetItem[] = [];
  const menus = role.menus ?? [];

  for (const menu of menus) {
    const menuId = menu.id;
    if (!menuId) continue;

    const subMenus = menu.subMenus ?? [];
    for (const subMenu of subMenus) {
      if (!subMenu.id) continue;
      assignments.push({
        menuId,
        subMenuId: subMenu.id,
        permissionIds: Array.from(new Set((subMenu.permissions ?? []).map((permission) => permission.id).filter(Boolean))),
      });
    }
  }

  return assignments;
}

function readRoleId(item: { roleID?: string; roleId?: string; RoleID?: string; RoleId?: string }): string {
  return item.roleID ?? item.roleId ?? item.RoleID ?? item.RoleId ?? '';
}

function resolveUserRoleState(roles: UserRoleReference[]): ResolvedUserRoleState {
  if (roles.length === 0) {
    return { baseRoleId: '', permissionsRoleId: '', hasCustomPermissions: false };
  }

  const primary = roles.find((role) => role.isPrimary);
  const nonPrimary = roles.find((role) => !role.isPrimary);

  // Regla de negocio:
  // - si existe un rol primario y otro no primario, el no primario es el rol base visible
  // - el primario representa los permisos efectivos cuando hubo personalizacion
  if (primary && nonPrimary) {
    return {
      baseRoleId: readRoleId(nonPrimary),
      permissionsRoleId: readRoleId(primary),
      hasCustomPermissions: true,
    };
  }

  const singleRoleId = readRoleId(primary ?? roles[0]);
  return { baseRoleId: singleRoleId, permissionsRoleId: singleRoleId, hasCustomPermissions: false };
}

function resolveUserRoleStateFromDetails(roles: UserRoleDetail[]): ResolvedUserRoleState {
  if (roles.length === 0) {
    return { baseRoleId: '', permissionsRoleId: '', hasCustomPermissions: false };
  }

  const primary = roles.find((role) => role.isPrimary);
  const nonPrimary = roles.find((role) => !role.isPrimary);

  if (primary && nonPrimary) {
    return { baseRoleId: nonPrimary.id, permissionsRoleId: primary.id, hasCustomPermissions: true };
  }

  const singleRoleId = (primary ?? roles[0])?.id ?? '';
  return { baseRoleId: singleRoleId, permissionsRoleId: singleRoleId, hasCustomPermissions: false };
}

export function UsersPage() {
  const token = useAuthStore((state) => state.token);

  // Estado del listado principal.
  const [items, setItems] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFiltersInput>(initialFilters);

  // Catalogos compartidos entre crear y editar.
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [menusCatalog, setMenusCatalog] = useState<SecurityMenuItem[]>([]);
  const [subMenusCatalog, setSubMenusCatalog] = useState<SecuritySubMenuItem[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<SecurityPermissionItem[]>([]);

  // Estado del modal de creacion.
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createRoleId, setCreateRoleId] = useState<string>('');
  const [createPermissions, setCreatePermissions] = useState<RolePermissionSetItem[]>([]);
  const [createRoleBaselinePermissions, setCreateRoleBaselinePermissions] = useState<RolePermissionSetItem[]>([]);

  // Estado del modal de detalle/edicion.
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [detailRoleId, setDetailRoleId] = useState<string>('');
  const [detailPermissionsRoleId, setDetailPermissionsRoleId] = useState<string>('');
  const [detailHasCustomPermissions, setDetailHasCustomPermissions] = useState(false);
  const [editPermissions, setEditPermissions] = useState<RolePermissionSetItem[]>([]);
  const [editRoleBaselinePermissions, setEditRoleBaselinePermissions] = useState<RolePermissionSetItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const resetCreateState = useCallback(() => {
    setCreateError(null);
    setCreateRoleId('');
    setCreatePermissions([]);
    setCreateRoleBaselinePermissions([]);
  }, []);

  const resetDetailState = useCallback(() => {
    setDetailUserId(null);
    setDetailUser(null);
    setDetailRoleId('');
    setDetailPermissionsRoleId('');
    setDetailHasCustomPermissions(false);
    setEditPermissions([]);
    setEditRoleBaselinePermissions([]);
    setDetailError(null);
    setIsEditMode(false);
    setUpdateError(null);
  }, []);

  const loadRoleBasedPermissions = useCallback(
    async (roleId: string): Promise<RolePermissionSetItem[]> => {
      if (!token || !roleId) return [];

      try {
        // Se consulta el rol y se adapta el resultado al formato esperado por el editor visual.
        const rolePermissionsResponse = await getRolePermissions(roleId);
        return cloneAssignments(buildAssignmentsFromRolePermissions(rolePermissionsResponse.data ?? [], subMenusCatalog));
      } catch {
        return [];
      }
    },
    [subMenusCatalog, token],
  );

  const loadUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await listUsers({ page: 1, pageSize: 25, ...filters });
      setItems(response.data ?? []);
      setTotal(response.meta?.total ?? 0);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load users.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  const openUserDetail = useCallback(
    async (id: string) => {
      if (!token) return;

      // Abrir el modal primero permite mostrar inmediatamente el estado de carga.
      setIsDetailOpen(true);
      setDetailUserId(id);
      setIsDetailLoading(true);
      setDetailError(null);
      setUpdateError(null);
      setIsEditMode(false);

      try {
        const [userResponse, userRolesResponse] = await Promise.all([getUser(id), getUserRoles(id)]);
        const currentUser = userResponse.data ?? null;
        setDetailUser(currentUser);

        // Preferimos el detalle enriquecido del usuario.
        // Si no llega esa informacion, reconstruimos el mismo estado desde la relacion de roles.
        const userRolesDetailed = currentUser?.roles ?? [];
        const resolved = userRolesDetailed.length > 0 ? resolveUserRoleStateFromDetails(userRolesDetailed) : resolveUserRoleState(userRolesResponse.data ?? []);
        setDetailHasCustomPermissions(resolved.hasCustomPermissions);
        setDetailRoleId(resolved.baseRoleId);
        setDetailPermissionsRoleId(resolved.permissionsRoleId);

        let roleDefaultAssignments: RolePermissionSetItem[] = [];

        if (userRolesDetailed.length > 0) {
          const permissionsSourceRole = userRolesDetailed.find((role) => role.id === resolved.permissionsRoleId) ?? userRolesDetailed[0];
          roleDefaultAssignments = cloneAssignments(buildAssignmentsFromRoleTree(permissionsSourceRole));
        }

        if (roleDefaultAssignments.length === 0) {
          roleDefaultAssignments = await loadRoleBasedPermissions(resolved.permissionsRoleId);
        }

        setEditPermissions(roleDefaultAssignments);
        setEditRoleBaselinePermissions(cloneAssignments(roleDefaultAssignments));
      } catch (detailErr) {
        setDetailError(getErrorMessage(detailErr, 'Failed to load user detail.'));
      } finally {
        setIsDetailLoading(false);
      }
    },
    [loadRoleBasedPermissions, token],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!token) return;

    const loadRoleOptions = async () => {
      // La API de roles es paginada, por eso se recorre hasta reunir suficientes opciones.
      const pageSize = 25;
      const maxPages = 40;
      const collected: Array<{ value: string; label: string }> = [];
      const seen = new Set<string>();
      let expectedTotal = Number.POSITIVE_INFINITY;

      for (let page = 1; page <= maxPages && collected.length < expectedTotal; page += 1) {
        const rolesResponse = await listRoles({ page, pageSize, sort: 'name', dir: 'asc' });
        const batch = rolesResponse.data ?? [];

        for (const role of batch) {
          if (!role.id || seen.has(role.id)) continue;
          seen.add(role.id);
          collected.push({ value: role.id, label: role.name });
        }

        if (typeof rolesResponse.meta?.total === 'number') {
          expectedTotal = rolesResponse.meta.total;
        }

        if (batch.length < pageSize) {
          break;
        }
      }

      return collected;
    };

    const loadCatalogs = async () => {
      // Roles, menus, submenus y permisos son fuentes independientes.
      // `allSettled` evita bloquear toda la pantalla si uno de los catalogos falla.
      const [rolesResult, menusResult, subMenusResult, permissionsResult] = await Promise.allSettled([
        loadRoleOptions(),
        listMenusCatalog(),
        listSubMenusCatalog(),
        listPermissionsCatalog(),
      ]);

      setRoleOptions(rolesResult.status === 'fulfilled' ? rolesResult.value : []);
      setMenusCatalog(menusResult.status === 'fulfilled' ? menusResult.value : []);
      setSubMenusCatalog(subMenusResult.status === 'fulfilled' ? subMenusResult.value : []);
      setPermissionsCatalog(permissionsResult.status === 'fulfilled' ? permissionsResult.value : []);
    };

    void loadCatalogs();
  }, [token]);

  const handleCreateRoleChange = useCallback(
    async (roleId: string) => {
      setCreateRoleId(roleId);
      if (!roleId) {
        setCreatePermissions([]);
        setCreateRoleBaselinePermissions([]);
        return;
      }

      // Al cambiar el rol base en creacion, reiniciamos permisos al baseline de ese rol.
      const defaults = await loadRoleBasedPermissions(roleId);
      const cloned = cloneAssignments(defaults);
      setCreatePermissions(cloned);
      setCreateRoleBaselinePermissions(cloned);
    },
    [loadRoleBasedPermissions],
  );

  const handleCreatePermissionsChange = useCallback(
    (next: RolePermissionSetItem[]) => {
      setCreatePermissions(next);
    },
    [],
  );

  const handleCreateResetToRole = useCallback(async () => {
    if (!createRoleId) return;

    // Si todavia no existe baseline en memoria, se vuelve a cargar desde el backend.
    if (createRoleBaselinePermissions.length === 0) {
      const baseline = await loadRoleBasedPermissions(createRoleId);
      const cloned = cloneAssignments(baseline);
      setCreateRoleBaselinePermissions(cloned);
      setCreatePermissions(cloned);
      return;
    }
    setCreatePermissions(cloneAssignments(createRoleBaselinePermissions));
  }, [createRoleBaselinePermissions, createRoleId, loadRoleBasedPermissions]);

  const handleEditRoleChange = useCallback(
    async (roleId: string) => {
      setDetailRoleId(roleId);
      setDetailPermissionsRoleId(roleId);
      if (!roleId) {
        setEditPermissions([]);
        setEditRoleBaselinePermissions([]);
        return;
      }

      // En edicion, cambiar el rol implica arrancar desde el baseline del nuevo rol
      // y no desde el snapshot previo del usuario.
      const defaults = await loadRoleBasedPermissions(roleId);
      const cloned = cloneAssignments(defaults);
      setEditPermissions(cloned);
      setEditRoleBaselinePermissions(cloned);
    },
    [loadRoleBasedPermissions],
  );

  const handleEditPermissionsChange = useCallback(
    (next: RolePermissionSetItem[]) => {
      setEditPermissions(next);
    },
    [],
  );

  const handleEditResetToRole = useCallback(async () => {
    if (!detailRoleId) return;

    // Se prioriza el rol que define permisos efectivos.
    if (editRoleBaselinePermissions.length === 0) {
      const baseline = await loadRoleBasedPermissions(detailPermissionsRoleId || detailRoleId);
      const cloned = cloneAssignments(baseline);
      setEditRoleBaselinePermissions(cloned);
      setEditPermissions(cloned);
      return;
    }
    setEditPermissions(cloneAssignments(editRoleBaselinePermissions));
  }, [detailPermissionsRoleId, detailRoleId, editRoleBaselinePermissions, loadRoleBasedPermissions]);

  return (
    <>
      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Security</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Users</h1>
              <p className="mt-1 text-sm text-slate-600">Search, review, create and edit users.</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>New User</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <UserFiltersForm defaultValues={filters} onSubmit={setFilters} />

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {isLoading ? 'Loading users...' : `Total users: ${total}`}
          </div>

          <TableShell>
            <Table>
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.username}</td>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">{user.email ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="secondary" onClick={() => void openUserDetail(user.id)}>
                        <span className="mr-2 inline-flex">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.46 12c1.53-3.57 5.11-6 9.54-6s8.01 2.43 9.54 6c-1.53 3.57-5.11 6-9.54 6s-8.01-2.43-9.54-6Z"
                            />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No users found.
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
        title="Create User"
        description="Add a new user with secure credentials and permission assignments."
        onClose={() => {
          setIsCreateOpen(false);
          resetCreateState();
        }}
      >
        <CreateUserForm
          roleOptions={roleOptions}
          menus={menusCatalog}
          subMenus={subMenusCatalog}
          permissionsCatalog={permissionsCatalog}
          permissionAssignments={createPermissions}
          onPermissionAssignmentsChange={handleCreatePermissionsChange}
          onRoleChange={(roleId) => {
            void handleCreateRoleChange(roleId);
          }}
          onResetToRolePermissions={() => {
            void handleCreateResetToRole();
          }}
          isSubmitting={isCreating}
          submitError={createError}
          onSubmit={async (values) => {
            if (!token) return;

            setIsCreating(true);
            setCreateError(null);
            try {
              await createUser({
                username: values.username,
                fullName: values.fullName,
                password: values.password,
                roleId: values.roleId,
                permissions: createPermissions,
                email: values.email || undefined,
                phone: values.phone || undefined,
              });
              setIsCreateOpen(false);
              resetCreateState();
              await loadUsers();
            } catch (createErr) {
              setCreateError(getErrorMessage(createErr, 'Failed to create user.'));
            } finally {
              setIsCreating(false);
            }
          }}
        />
      </Dialog>

      <Dialog
        open={isDetailOpen}
        size="xl"
        title={isEditMode ? 'Edit User' : 'User Detail'}
        description={isEditMode ? 'Update user information with current data preloaded.' : 'Review user details and switch to edit mode.'}
        onClose={() => {
          setIsDetailOpen(false);
          resetDetailState();
        }}
      >
        {isDetailLoading ? <p className="text-sm text-slate-600">Loading user detail...</p> : null}

        {!isDetailLoading && detailError ? (
          <div className="space-y-3">
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{detailError}</p>
            <Button
              variant="secondary"
              onClick={() => {
                if (detailUser?.id) {
                  void openUserDetail(detailUser.id);
                } else if (detailUserId) {
                  void openUserDetail(detailUserId);
                }
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!isDetailLoading && !detailError && detailUser && !isEditMode ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">View Mode</span>
                {detailHasCustomPermissions ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    Custom permissions active
                  </span>
                ) : null}
              </div>
              <Button onClick={() => setIsEditMode(true)}>Edit</Button>
            </div>

            <UpdateUserForm
              user={detailUser}
              roleOptions={roleOptions}
              initialRoleId={detailRoleId}
              menus={menusCatalog}
              subMenus={subMenusCatalog}
              permissionsCatalog={permissionsCatalog}
              permissionAssignments={editPermissions}
              onPermissionAssignmentsChange={handleEditPermissionsChange}
              onRoleChange={(roleId) => {
                void handleEditRoleChange(roleId);
              }}
              onResetToRolePermissions={() => {
                void handleEditResetToRole();
              }}
              isSubmitting={false}
              submitError={null}
              onCancel={() => setIsEditMode(false)}
              onSubmit={async () => Promise.resolve()}
              readOnly
            />
          </div>
        ) : null}

        {!isDetailLoading && !detailError && detailUser && isEditMode ? (
          <UpdateUserForm
            user={detailUser}
            roleOptions={roleOptions}
            initialRoleId={detailRoleId}
            menus={menusCatalog}
            subMenus={subMenusCatalog}
            permissionsCatalog={permissionsCatalog}
            permissionAssignments={editPermissions}
            onPermissionAssignmentsChange={handleEditPermissionsChange}
            onRoleChange={(roleId) => {
              void handleEditRoleChange(roleId);
            }}
            onResetToRolePermissions={() => {
              void handleEditResetToRole();
            }}
            isSubmitting={isUpdating}
            submitError={updateError}
            onCancel={() => {
              setIsEditMode(false);
              setUpdateError(null);
            }}
            onSubmit={async (values) => {
              if (!token || !detailUser.id) return;

              setIsUpdating(true);
              setUpdateError(null);
              try {
                const response = await updateUser(detailUser.id, {
                  fullName: values.fullName,
                  roleId: values.roleId,
                  permissions: editPermissions,
                  email: values.email || undefined,
                  phone: values.phone || undefined,
                  isActive: values.isActive,
                });

                // Actualizamos el usuario abierto y luego refrescamos la tabla para mantener ambas vistas sincronizadas.
                setDetailUser(response.data ?? detailUser);
                setDetailRoleId(values.roleId);
                setIsEditMode(false);
                await loadUsers();
              } catch (updateErr) {
                setUpdateError(getErrorMessage(updateErr, 'Failed to update user.'));
              } finally {
                setIsUpdating(false);
              }
            }}
          />
        ) : null}
      </Dialog>
    </>
  );
}
