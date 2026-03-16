import { http } from '../../../shared/lib/http';
import type { CreateRolePayload, RolePermissionSetItem, RolePermissionsResponse, RoleResponse, RolesListResponse, RolesQuery } from '../types/roles.types';

function toQueryString(query: RolesQuery): string {
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

function normalizeRole(raw: unknown) {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    name: readString(source, 'name', 'Name') ?? '',
    description: readString(source, 'description', 'Description'),
    isActive: readBoolean(source, 'isActive', 'IsActive'),
    createdAtUtc: readString(source, 'createdAtUtc', 'CreatedAtUtc'),
    updatedAtUtc: readString(source, 'updatedAtUtc', 'UpdatedAtUtc'),
  };
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

function normalizeRolePermission(raw: unknown) {
  const source = (raw ?? {}) as AnyRecord;

  return {
    roleID: readString(source, 'roleID', 'roleId', 'RoleID', 'RoleId'),
    subMenuID: readString(source, 'subMenuID', 'subMenuId', 'SubMenuID', 'SubMenuId'),
    permissionID: readString(source, 'permissionID', 'permissionId', 'PermissionID', 'PermissionId'),
  };
}

export async function listRoles(query: RolesQuery): Promise<RolesListResponse> {
  const response = await http.get<unknown>(`/api/v1/roles${toQueryString(query)}`);
  const data = getEnvelopeData<unknown[]>(response);
  const meta = getEnvelopeMeta<RolesListResponse['meta']>(response);

  return {
    data: Array.isArray(data) ? data.map(normalizeRole) : [],
    meta,
  };
}

export async function createRole(payload: CreateRolePayload): Promise<RoleResponse> {
  const response = await http.post<unknown>('/api/v1/roles', payload);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeRole(data) : undefined,
  };
}

export async function getRolePermissions(roleId: string): Promise<RolePermissionsResponse> {
  const response = await http.get<unknown>(`/api/v1/roles/${roleId}/permissions`);
  const data = getEnvelopeData<unknown[]>(response);

  return {
    data: Array.isArray(data) ? data.map(normalizeRolePermission) : [],
  };
}

export async function setRolePermissions(roleId: string, items: RolePermissionSetItem[]): Promise<void> {
  await http.put<unknown>(`/api/v1/roles/${roleId}/permissions`, { items });
}
