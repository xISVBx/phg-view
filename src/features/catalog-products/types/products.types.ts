export type ProductsQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type ProductItem = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  notes?: string;
  commissionType?: string;
  cost?: number;
  basePrice?: number;
  commissionValue?: number;
  defaultLeadDays?: number;
  requiresDelivery?: boolean;
  isActive?: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type ProductCategoryItem = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type ProductResponse = {
  data?: ProductItem;
};

export type ProductsListResponse = {
  data?: ProductItem[];
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
};

export type CreateProductPayload = {
  categoryId: string;
  name: string;
  type: string;
  notes?: string;
  commissionType?: string;
  cost?: number;
  basePrice?: number;
  commissionValue?: number;
  defaultLeadDays?: number;
  requiresDelivery?: boolean;
};

export type UpdateProductPayload = CreateProductPayload;
