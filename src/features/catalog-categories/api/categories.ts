import { http } from '../../../shared/lib/http';
import type { ProductCategoryItem } from '../types/products.types';

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

function normalizeCategory(raw: unknown): ProductCategoryItem {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    name: readString(source, 'name', 'Name') ?? '',
    description: readString(source, 'description', 'Description'),
    isActive: readBoolean(source, 'isActive', 'IsActive'),
  };
}

export async function listProductCategories(): Promise<ProductCategoryItem[]> {
  const response = await http.get<unknown>('/v1/categories?page=1&pageSize=100&sort=name&dir=asc');
  const data = getEnvelopeData<unknown[]>(response);
  return Array.isArray(data) ? data.map(normalizeCategory).filter((item) => item.id) : [];
}
