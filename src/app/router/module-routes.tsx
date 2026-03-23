import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { LazyPage, lazyPage } from './lazy-page';

const AppointmentsPage = lazyPage(() => import('../../features/appointments/pages/appointments-page'), 'AppointmentsPage');
const AuditLogsPage = lazyPage(() => import('../../features/audit-logs/pages/audit-logs-page'), 'AuditLogsPage');
const CashCategoriesPage = lazyPage(() => import('../../features/cash-categories/pages/cash-categories-page'), 'CashCategoriesPage');
const CashMovementsPage = lazyPage(() => import('../../features/cash-movements/pages/cash-movements-page'), 'CashMovementsPage');
const CatalogPage = lazyPage(() => import('../../features/catalog/pages/catalog-page'), 'CatalogPage');
const CategoriesPage = lazyPage(() => import('../../features/catalog-categories/pages/categories-page'), 'CategoriesPage');
const ProductsPage = lazyPage(() => import('../../features/catalog-products/pages/products-page'), 'ProductsPage');
const CustomersPage = lazyPage(() => import('../../features/customers/pages/customers-page'), 'CustomersPage');
const FilesPage = lazyPage(() => import('../../features/files/pages/files-page'), 'FilesPage');
const MenusPage = lazyPage(() => import('../../features/security-menus/pages/menus-page'), 'MenusPage');
const PermissionsPage = lazyPage(() => import('../../features/security-permissions/pages/permissions-page'), 'PermissionsPage');
const RolesPage = lazyPage(() => import('../../features/security-roles/pages/roles-page'), 'RolesPage');
const SubmenusPage = lazyPage(() => import('../../features/security-submenus/pages/submenus-page'), 'SubmenusPage');
const UsersPage = lazyPage(() => import('../../features/security-users/pages/users-page'), 'UsersPage');
const SettingsPage = lazyPage(() => import('../../features/settings/pages/settings-page'), 'SettingsPage');
const SystemPage = lazyPage(() => import('../../features/system/pages/system-page'), 'SystemPage');
const WorkOrdersPage = lazyPage(() => import('../../features/work-orders/pages/work-orders-page'), 'WorkOrdersPage');
const WorkersPage = lazyPage(() => import('../../features/workers/pages/workers-page'), 'WorkersPage');
const SalesPage = lazyPage(() => import('../../features/sales/pages/sales-page'), 'SalesPage');

type ModuleRoute = {
  path: string;
  element: ReactElement;
};

export const moduleRoutes: ModuleRoute[] = [
  { path: '/users', element: <LazyPage component={UsersPage} /> },
  { path: '/roles', element: <LazyPage component={RolesPage} /> },
  { path: '/permissions', element: <LazyPage component={PermissionsPage} /> },
  { path: '/menus', element: <LazyPage component={MenusPage} /> },
  { path: '/submenus', element: <LazyPage component={SubmenusPage} /> },
  { path: '/catalog', element: <LazyPage component={CatalogPage} /> },
  { path: '/catalog/products', element: <LazyPage component={ProductsPage} /> },
  { path: '/catalog/categories', element: <LazyPage component={CategoriesPage} /> },
  { path: '/products', element: <Navigate to="/catalog/products" replace /> },
  { path: '/categories', element: <Navigate to="/catalog/categories" replace /> },
  { path: '/customers', element: <LazyPage component={CustomersPage} /> },
  { path: '/sales', element: <LazyPage component={SalesPage} /> },
  { path: '/appointments', element: <LazyPage component={AppointmentsPage} /> },
  { path: '/work-orders', element: <LazyPage component={WorkOrdersPage} /> },
  { path: '/workers', element: <LazyPage component={WorkersPage} /> },
  { path: '/cash/categories', element: <LazyPage component={CashCategoriesPage} /> },
  { path: '/cash/movements', element: <LazyPage component={CashMovementsPage} /> },
  { path: '/settings', element: <LazyPage component={SettingsPage} /> },
  { path: '/audit-logs', element: <LazyPage component={AuditLogsPage} /> },
  { path: '/files', element: <LazyPage component={FilesPage} /> },
  { path: '/system', element: <LazyPage component={SystemPage} /> },
];
