import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { AppointmentsPage } from '../../features/appointments/pages/appointments-page';
import { AuditLogsPage } from '../../features/audit-logs/pages/audit-logs-page';
import { CashCategoriesPage } from '../../features/cash-categories/pages/cash-categories-page';
import { CashMovementsPage } from '../../features/cash-movements/pages/cash-movements-page';
import { CatalogPage } from '../../features/catalog/pages/catalog-page';
import { CategoriesPage } from '../../features/catalog-categories/pages/categories-page';
import { ProductsPage } from '../../features/catalog-products/pages/products-page';
import { CustomersPage } from '../../features/customers/pages/customers-page';
import { FilesPage } from '../../features/files/pages/files-page';
import { MenusPage } from '../../features/security-menus/pages/menus-page';
import { PermissionsPage } from '../../features/security-permissions/pages/permissions-page';
import { RolesPage } from '../../features/security-roles/pages/roles-page';
import { SubmenusPage } from '../../features/security-submenus/pages/submenus-page';
import { UsersPage } from '../../features/security-users/pages/users-page';
import { SettingsPage } from '../../features/settings/pages/settings-page';
import { SystemPage } from '../../features/system/pages/system-page';
import { WorkOrdersPage } from '../../features/work-orders/pages/work-orders-page';
import { WorkersPage } from '../../features/workers/pages/workers-page';
import { SalesPage } from '../../features/sales/pages/sales-page';

type ModuleRoute = {
  path: string;
  element: ReactElement;
};

export const moduleRoutes: ModuleRoute[] = [
  { path: '/users', element: <UsersPage /> },
  { path: '/roles', element: <RolesPage /> },
  { path: '/permissions', element: <PermissionsPage /> },
  { path: '/menus', element: <MenusPage /> },
  { path: '/submenus', element: <SubmenusPage /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/catalog/products', element: <ProductsPage /> },
  { path: '/catalog/categories', element: <CategoriesPage /> },
  { path: '/products', element: <Navigate to="/catalog/products" replace /> },
  { path: '/categories', element: <Navigate to="/catalog/categories" replace /> },
  { path: '/customers', element: <CustomersPage /> },
  { path: '/sales', element: <SalesPage /> },
  { path: '/appointments', element: <AppointmentsPage /> },
  { path: '/work-orders', element: <WorkOrdersPage /> },
  { path: '/workers', element: <WorkersPage /> },
  { path: '/cash/categories', element: <CashCategoriesPage /> },
  { path: '/cash/movements', element: <CashMovementsPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/audit-logs', element: <AuditLogsPage /> },
  { path: '/files', element: <FilesPage /> },
  { path: '/system', element: <SystemPage /> },
];
