import { http } from '../../../shared/lib/http';
import type { SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem } from '../types/users.types';

type ListResponse<T> = { data?: T[] };
type AnyRecord = Record<string, unknown>;

function getEnvelopeData<T>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = raw as AnyRecord;
  return (source.data as T | undefined) ?? (source.Data as T | undefined);
}

function readString(source: AnyRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function normalizeMenu(raw: unknown): SecurityMenuItem {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    name: readString(source, 'name', 'Name') ?? '-',
    code: readString(source, 'code', 'Code'),
  };
}

function normalizeSubMenu(raw: unknown): SecuritySubMenuItem {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    menuId: readString(source, 'menuID', 'menuId', 'MenuID') ?? '',
    name: readString(source, 'name', 'Name') ?? '-',
    code: readString(source, 'code', 'Code'),
  };
}

function normalizePermission(raw: unknown): SecurityPermissionItem {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    name: readString(source, 'name', 'Name') ?? '-',
    code: readString(source, 'code', 'Code'),
  };
}

export async function listMenusCatalog(): Promise<SecurityMenuItem[]> {
  const response = await http.get<ListResponse<unknown> | unknown>('/api/v1/menus?page=1&pageSize=100&sort=name&dir=asc');
  const data = getEnvelopeData<unknown[]>(response);
  return (Array.isArray(data) ? data : []).map(normalizeMenu).filter((item) => item.id);
}

export async function listSubMenusCatalog(): Promise<SecuritySubMenuItem[]> {
  const response = await http.get<ListResponse<unknown> | unknown>('/api/v1/submenus?page=1&pageSize=150&sort=name&dir=asc');
  const data = getEnvelopeData<unknown[]>(response);
  return (Array.isArray(data) ? data : []).map(normalizeSubMenu).filter((item) => item.id && item.menuId);
}

export async function listPermissionsCatalog(): Promise<SecurityPermissionItem[]> {
  const response = await http.get<ListResponse<unknown> | unknown>('/api/v1/permissions?page=1&pageSize=150&sort=name&dir=asc');
  const data = getEnvelopeData<unknown[]>(response);
  return (Array.isArray(data) ? data : []).map(normalizePermission).filter((item) => item.id);
}
