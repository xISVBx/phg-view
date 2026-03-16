import { http } from '../../../shared/lib/http';
import type { CreateProductPayload, ProductItem, ProductResponse, ProductsListResponse, ProductsQuery, UpdateProductPayload } from '../types/products.types';

type AnyRecord = Record<string, unknown>;

function toQueryString(query: ProductsQuery): string {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.q) params.set('q', query.q);
  if (query.sort) params.set('sort', query.sort);
  if (query.dir) params.set('dir', query.dir);

  const suffix = params.toString();
  return suffix ? `?${suffix}` : '';
}

function readString(source: AnyRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

function readNumber(source: AnyRecord, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
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

function normalizeProduct(raw: unknown): ProductItem {
  const source = (raw ?? {}) as AnyRecord;

  return {
    id: readString(source, 'id', 'ID') ?? '',
    categoryId: readString(source, 'categoryId', 'categoryID', 'CategoryID', 'CategoryId') ?? '',
    name: readString(source, 'name', 'Name') ?? '',
    type: readString(source, 'type', 'Type') ?? '',
    notes: readString(source, 'notes', 'Notes'),
    commissionType: readString(source, 'commissionType', 'CommissionType'),
    cost: readNumber(source, 'cost', 'Cost'),
    basePrice: readNumber(source, 'basePrice', 'BasePrice'),
    commissionValue: readNumber(source, 'commissionValue', 'CommissionValue'),
    defaultLeadDays: readNumber(source, 'defaultLeadDays', 'DefaultLeadDays'),
    requiresDelivery: readBoolean(source, 'requiresDelivery', 'RequiresDelivery'),
    isActive: readBoolean(source, 'isActive', 'IsActive'),
    createdAtUtc: readString(source, 'createdAtUtc', 'CreatedAtUtc'),
    updatedAtUtc: readString(source, 'updatedAtUtc', 'UpdatedAtUtc'),
  };
}

export async function listProducts(query: ProductsQuery): Promise<ProductsListResponse> {
  const response = await http.get<unknown>(`/api/v1/products${toQueryString(query)}`);
  const data = getEnvelopeData<unknown[]>(response);
  const meta = getEnvelopeMeta<ProductsListResponse['meta']>(response);

  return {
    data: Array.isArray(data) ? data.map(normalizeProduct) : [],
    meta,
  };
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
  const response = await http.post<unknown>('/api/v1/products', payload);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeProduct(data) : undefined,
  };
}

export async function getProduct(id: string): Promise<ProductResponse> {
  const response = await http.get<unknown>(`/api/v1/products/${id}`);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeProduct(data) : undefined,
  };
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<ProductResponse> {
  const response = await http.put<unknown>(`/api/v1/products/${id}`, payload);
  const data = getEnvelopeData<unknown>(response);

  return {
    data: data ? normalizeProduct(data) : undefined,
  };
}

export async function activateProduct(id: string): Promise<void> {
  await http.patch(`/api/v1/products/${id}/activate`);
}

export async function deactivateProduct(id: string): Promise<void> {
  await http.patch(`/api/v1/products/${id}/deactivate`);
}
