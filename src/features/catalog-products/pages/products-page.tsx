import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { activateProduct, createProduct, deactivateProduct, getProduct, listProducts, updateProduct } from '../api/products';
import { ProductFiltersForm } from '../components/product-filters-form';
import { ProductForm } from '../components/product-form';
import { productFiltersSchema, type ProductFiltersInput } from '../schemas/product-filters.schema';
import type { ProductCategoryItem, ProductItem } from '../types/products.types';
import { getErrorMessage } from '../../../shared/lib/http';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Dialog } from '../../../shared/components/ui/dialog';
import { Table, TableShell } from '../../../shared/components/ui/table';
import { listProductCategories } from '../../catalog-categories/api/categories';

const initialFilters = productFiltersSchema.parse({ q: '', sort: 'name', dir: 'asc' });

function formatCurrency(value?: number): string {
  if (typeof value !== 'number') return '-';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

function formatCategoryName(categories: ProductCategoryItem[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? categoryId ?? '-';
}

export function ProductsPage() {
  const token = useAuthStore((state) => state.token);

  const [items, setItems] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFiltersInput>(initialFilters);
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const detailCategoryName = useMemo(
    () => (detailProduct ? formatCategoryName(categories, detailProduct.categoryId) : '-'),
    [categories, detailProduct],
  );

  const loadProducts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await listProducts({ page: 1, pageSize: 25, ...filters });
      setItems(response.data ?? []);
      setTotal(response.meta?.total ?? 0);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'No se pudo cargar el catalogo de productos.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  const loadCategories = useCallback(async () => {
    if (!token) return;

    try {
      const response = await listProductCategories();
      setCategories(response);
    } catch {
      setCategories([]);
    }
  }, [token]);

  const openProductDetail = useCallback(
    async (productId: string) => {
      if (!token) return;

      setIsDetailOpen(true);
      setIsDetailLoading(true);
      setIsEditMode(false);
      setDetailError(null);
      setUpdateError(null);
      setStatusActionError(null);

      try {
        const response = await getProduct(productId);
        setDetailProduct(response.data ?? null);
      } catch (detailLoadError) {
        setDetailError(getErrorMessage(detailLoadError, 'No se pudo cargar el detalle del producto.'));
      } finally {
        setIsDetailLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return (
    <>
      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Catalog / Products</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Productos</h1>
              <p className="mt-1 text-sm text-slate-600">Administra el catalogo de productos, sus costos, precios y estado operativo.</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>Nuevo producto</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProductFiltersForm defaultValues={filters} onSubmit={setFilters} />

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {isLoading ? 'Cargando productos...' : `Total productos: ${total}`}
          </div>

          <TableShell>
            <Table>
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Precio base</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Accion</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">{formatCategoryName(categories, product.categoryId)}</td>
                    <td className="px-4 py-3">{product.type || '-'}</td>
                    <td className="px-4 py-3">{formatCurrency(product.basePrice)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="secondary" onClick={() => void openProductDetail(product.id)}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      No se encontraron productos.
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
        title="Crear producto"
        description="Registra un nuevo producto usando el contrato definido en OpenAPI."
        onClose={() => {
          setIsCreateOpen(false);
          setCreateError(null);
        }}
      >
        <ProductForm
          categories={categories}
          isSubmitting={isCreating}
          submitError={createError}
          onSubmit={async (values) => {
            if (!token) return;

            setIsCreating(true);
            setCreateError(null);
            try {
              await createProduct({
                categoryId: values.categoryId,
                name: values.name,
                type: values.type,
                notes: values.notes || undefined,
                commissionType: values.commissionType || undefined,
                cost: values.cost,
                basePrice: values.basePrice,
                commissionValue: values.commissionValue,
                defaultLeadDays: values.defaultLeadDays,
                requiresDelivery: values.requiresDelivery,
              });
              setIsCreateOpen(false);
              await loadProducts();
            } catch (createProductError) {
              setCreateError(getErrorMessage(createProductError, 'No se pudo crear el producto.'));
            } finally {
              setIsCreating(false);
            }
          }}
        />
      </Dialog>

      <Dialog
        open={isDetailOpen}
        size="xl"
        title={isEditMode ? 'Editar producto' : 'Detalle del producto'}
        description={isEditMode ? 'Actualiza la informacion operativa y comercial del producto.' : 'Consulta el detalle y cambia el estado del producto.'}
        onClose={() => {
          setIsDetailOpen(false);
          setIsDetailLoading(false);
          setDetailError(null);
          setDetailProduct(null);
          setIsEditMode(false);
          setUpdateError(null);
          setStatusActionError(null);
        }}
      >
        {isDetailLoading ? <p className="text-sm text-slate-600">Cargando detalle del producto...</p> : null}

        {!isDetailLoading && detailError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{detailError}</p> : null}

        {!isDetailLoading && !detailError && detailProduct && !isEditMode ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">Modo detalle</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    detailProduct.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {detailProduct.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setIsEditMode(true)}>
                  Editar
                </Button>
                <Button
                  variant={detailProduct.isActive ? 'danger' : 'primary'}
                  disabled={isTogglingStatus}
                  onClick={async () => {
                    setIsTogglingStatus(true);
                    setStatusActionError(null);
                    try {
                      if (detailProduct.isActive) {
                        await deactivateProduct(detailProduct.id);
                      } else {
                        await activateProduct(detailProduct.id);
                      }

                      const refreshed = await getProduct(detailProduct.id);
                      setDetailProduct(refreshed.data ?? detailProduct);
                      await loadProducts();
                    } catch (statusError) {
                      setStatusActionError(getErrorMessage(statusError, 'No se pudo cambiar el estado del producto.'));
                    } finally {
                      setIsTogglingStatus(false);
                    }
                  }}
                >
                  {isTogglingStatus ? 'Procesando...' : detailProduct.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </div>

            {statusActionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{statusActionError}</p> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{detailProduct.name}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{detailCategoryName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{detailProduct.type || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requiere entrega</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{detailProduct.requiresDelivery ? 'Si' : 'No'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Costo</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(detailProduct.cost)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Precio base</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(detailProduct.basePrice)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de comision</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{detailProduct.commissionType ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valor de comision</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(detailProduct.commissionValue)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{detailProduct.notes?.trim() ? detailProduct.notes : 'Sin notas registradas.'}</p>
            </div>
          </div>
        ) : null}

        {!isDetailLoading && !detailError && detailProduct && isEditMode ? (
          <ProductForm
            categories={categories}
            defaultValues={{
              categoryId: detailProduct.categoryId,
              name: detailProduct.name,
              type: detailProduct.type,
              notes: detailProduct.notes ?? '',
              commissionType: detailProduct.commissionType ?? '',
              cost: detailProduct.cost,
              basePrice: detailProduct.basePrice,
              commissionValue: detailProduct.commissionValue,
              defaultLeadDays: detailProduct.defaultLeadDays,
              requiresDelivery: detailProduct.requiresDelivery ?? false,
            }}
            isSubmitting={isUpdating}
            submitError={updateError}
            onCancel={() => {
              setIsEditMode(false);
              setUpdateError(null);
            }}
            onSubmit={async (values) => {
              setIsUpdating(true);
              setUpdateError(null);
              try {
                const response = await updateProduct(detailProduct.id, {
                  categoryId: values.categoryId,
                  name: values.name,
                  type: values.type,
                  notes: values.notes || undefined,
                  commissionType: values.commissionType || undefined,
                  cost: values.cost,
                  basePrice: values.basePrice,
                  commissionValue: values.commissionValue,
                  defaultLeadDays: values.defaultLeadDays,
                  requiresDelivery: values.requiresDelivery,
                });

                setDetailProduct(response.data ?? detailProduct);
                setIsEditMode(false);
                await loadProducts();
              } catch (updateProductError) {
                setUpdateError(getErrorMessage(updateProductError, 'No se pudo actualizar el producto.'));
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
