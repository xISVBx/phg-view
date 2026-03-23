import { http } from '../../../shared/lib/http';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserItem,
  UserResponse,
  UserRoleDetail,
  UserRoleMenu,
  UserRolePermission,
  UserRoleSubMenu,
  UserRolesResponse,
  UsersListResponse,
  UsersQuery,
} from '../types/users.types';

function toQueryString(query: UsersQuery): string {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.q) params.set('q', query.q);
  if (query.sort) params.set('sort', query.sort);
  if (query.dir) params.set('dir', query.dir);

  const suffix = params.toString();
  return suffix ? `?${suffix}` : '';
}

type AnyRecord = Record<string, unknown>;

function readString(source: AnyRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function readBoolean(source: AnyRecord, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function getEnvelopeData<T>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = raw as AnyRecord;
  return (source.data as T | undefined) ?? (source.Data as T | undefined);
}

function getEnvelopeMeta<T>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = raw as AnyRecord;
  return (source.meta as T | undefined) ?? (source.Meta as T | undefined);
}

function normalizeRolePermission(raw: unknown): UserRolePermission {
  const source = (raw ?? {}) as AnyRecord;
  return {
    id: readString(source, 'id', 'ID') ?? '',
    code: readString(source, 'code', 'Code'),
    name: readString(source, 'name', 'Name'),
  };
}

function normalizeRoleSubMenu(raw: unknown): UserRoleSubMenu {
  const source = (raw ?? {}) as AnyRecord;
  const permissionsRaw = source.permissions ?? source.Permissions;
  return {
    id: readString(source, 'id', 'ID') ?? '',
    code: readString(source, 'code', 'Code'),
    name: readString(source, 'name', 'Name'),
    permissions: Array.isArray(permissionsRaw) ? permissionsRaw.map(normalizeRolePermission).filter((item) => item.id) : [],
  };
}

function normalizeRoleMenu(raw: unknown): UserRoleMenu {
  const source = (raw ?? {}) as AnyRecord;
  const subMenusRaw = source.subMenus ?? source.SubMenus;
  return {
    id: readString(source, 'id', 'ID') ?? '',
    code: readString(source, 'code', 'Code'),
    name: readString(source, 'name', 'Name'),
    subMenus: Array.isArray(subMenusRaw) ? subMenusRaw.map(normalizeRoleSubMenu).filter((item) => item.id) : [],
  };
}

function normalizeUserRole(raw: unknown): UserRoleDetail {
  const source = (raw ?? {}) as AnyRecord;
  const menusRaw = source.menus ?? source.Menus;
  return {
    id: readString(source, 'id', 'ID', 'roleID', 'roleId', 'RoleID', 'RoleId') ?? '',
    name: readString(source, 'name', 'Name'),
    description: readString(source, 'description', 'Description'),
    isActive: readBoolean(source, 'isActive', 'IsActive'),
    isPrimary: readBoolean(source, 'isPrimary', 'IsPrimary'),
    menus: Array.isArray(menusRaw) ? menusRaw.map(normalizeRoleMenu).filter((item) => item.id) : [],
  };
}

function normalizeUser(raw: unknown): UserItem {
  const source = (raw ?? {}) as AnyRecord;
  const rolesRaw = source.roles ?? source.Roles;
  return {
    id: readString(source, 'id', 'ID') ?? '',
    username: readString(source, 'username', 'Username') ?? '',
    fullName: readString(source, 'fullName', 'FullName') ?? '',
    phone: readString(source, 'phone', 'Phone'),
    email: readString(source, 'email', 'Email'),
    isActive: readBoolean(source, 'isActive', 'IsActive'),
    createdAtUtc: readString(source, 'createdAtUtc', 'CreatedAtUtc'),
    updatedAtUtc: readString(source, 'updatedAtUtc', 'UpdatedAtUtc'),
    roles: Array.isArray(rolesRaw) ? rolesRaw.map(normalizeUserRole).filter((item) => item.id) : [],
  };
}

export async function listUsers(query: UsersQuery): Promise<UsersListResponse> {
  const response = await http.get<unknown>(`/v1/users${toQueryString(query)}`);
  const data = getEnvelopeData<unknown[]>(response);
  const meta = getEnvelopeMeta<UsersListResponse['meta']>(response);

  return {
    data: Array.isArray(data) ? data.map(normalizeUser) : [],
    meta,
  };
}

export async function createUser(payload: CreateUserPayload): Promise<UserResponse> {
  const response = await http.post<unknown>('/v1/users', payload);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeUser(data) : undefined,
  };
}

export async function getUser(id: string): Promise<UserResponse> {
  const response = await http.get<unknown>(`/v1/users/${id}`);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeUser(data) : undefined,
  };
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
  const response = await http.put<unknown>(`/v1/users/${id}`, payload);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeUser(data) : undefined,
  };
}

export async function getUserRoles(id: string): Promise<UserRolesResponse> {
  const response = await http.get<unknown>(`/v1/users/${id}/roles`);
  const data = getEnvelopeData<unknown[]>(response);

  return {
    data: Array.isArray(data)
      ? data.map((item) => {
          const source = (item ?? {}) as AnyRecord;
          return {
            roleID: readString(source, 'roleID', 'roleId', 'RoleID', 'RoleId'),
            roleId: readString(source, 'roleId', 'roleID', 'RoleId', 'RoleID'),
            isPrimary: readBoolean(source, 'isPrimary', 'IsPrimary'),
          };
        })
      : [],
  };
}
