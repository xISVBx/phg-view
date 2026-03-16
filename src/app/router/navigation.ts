export type ModuleRouteDef = {
  path: string;
  title: string;
  description: string;
};

export const moduleRouteDefs: ModuleRouteDef[] = [
  { path: 'users', title: 'Users', description: 'Manage users and account lifecycle.' },
  { path: 'roles', title: 'Roles', description: 'Configure role definitions and governance.' },
  { path: 'permissions', title: 'Permissions', description: 'Review and manage permission catalog.' },
  { path: 'menus', title: 'Menus', description: 'Configure application menu structure.' },
  { path: 'submenus', title: 'Submenus', description: 'Manage navigation entry points and routes.' },
  { path: 'catalog', title: 'Catalog', description: 'Group business catalogs such as products and categories.' },
  { path: 'catalog/products', title: 'Products', description: 'Manage catalog products and status.' },
  { path: 'catalog/categories', title: 'Categories', description: 'Manage product and business categories.' },
  { path: 'customers', title: 'Customers', description: 'Manage customers and activation status.' },
  { path: 'sales', title: 'Sales', description: 'Track sales and payment operations.' },
  { path: 'appointments', title: 'Appointments', description: 'Manage appointments lifecycle.' },
  { path: 'work-orders', title: 'Work Orders', description: 'Manage operational work orders.' },
  { path: 'workers', title: 'Workers', description: 'Manage workers, payroll and commissions.' },
  { path: 'cash/categories', title: 'Cash Categories', description: 'Manage cash movement categories.' },
  { path: 'cash/movements', title: 'Cash Movements', description: 'Track cash inflow and outflow records.' },
  { path: 'settings', title: 'Settings', description: 'Manage system-level settings and keys.' },
  { path: 'audit-logs', title: 'Audit Logs', description: 'Review system activity and audits.' },
  { path: 'files', title: 'Files', description: 'Browse and manage uploaded files.' },
  { path: 'system', title: 'System', description: 'Inspect system health and backup status.' },
];

const subMenuCodeToPath: Record<string, string> = {
  users: '/users',
  user: '/users',
  roles: '/roles',
  role: '/roles',
  permissions: '/permissions',
  permission: '/permissions',
  menus: '/menus',
  menu: '/menus',
  submenus: '/submenus',
  submenu: '/submenus',
  catalog: '/catalog',
  products: '/catalog/products',
  product: '/catalog/products',
  categories: '/catalog/categories',
  category: '/catalog/categories',
  customers: '/customers',
  customer: '/customers',
  sales: '/sales',
  sale: '/sales',
  appointments: '/appointments',
  appointment: '/appointments',
  workorders: '/work-orders',
  workorder: '/work-orders',
  'work-orders': '/work-orders',
  workers: '/workers',
  worker: '/workers',
  cashcategories: '/cash/categories',
  'cash-categories': '/cash/categories',
  cashmovements: '/cash/movements',
  'cash-movements': '/cash/movements',
  settings: '/settings',
  setting: '/settings',
  audit: '/audit-logs',
  auditlogs: '/audit-logs',
  files: '/files',
  file: '/files',
  system: '/system',
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function resolveSubMenuPath(menuCode?: string, subMenuCode?: string): string {
  const rawSubMenu = (subMenuCode ?? '').trim();
  const rawMenu = (menuCode ?? '').trim();

  if (rawSubMenu.length > 0) {
    const normalized = normalizeToken(rawSubMenu);
    if (subMenuCodeToPath[normalized]) {
      return subMenuCodeToPath[normalized];
    }

    const tokens = rawSubMenu
      .split(/[._:/\-]/)
      .map((token) => normalizeToken(token))
      .filter(Boolean);

    for (const token of tokens) {
      if (subMenuCodeToPath[token]) {
        return subMenuCodeToPath[token];
      }
    }
  }

  const menu = encodeURIComponent(rawMenu || 'menu');
  const subMenu = encodeURIComponent(rawSubMenu || 'item');
  return `/workspace/${menu}/${subMenu}`;
}

export function getModuleRouteDef(pathname: string): ModuleRouteDef | undefined {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  return moduleRouteDefs.find((route) => route.path === normalizedPath);
}
