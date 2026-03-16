export type RoleItem = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type RolesListResponse = {
  data?: RoleItem[];
  meta?: {
    total?: number;
  };
};

export type CreateRolePayload = {
  name: string;
  description?: string;
};

export type RolePermissionSetItem = {
  menuId: string;
  subMenuId: string;
  permissionIds: string[];
};

export type RoleResponse = {
  data?: RoleItem;
};

export type RolesQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type RoleSubMenuPermission = {
  roleID?: string;
  subMenuID?: string;
  permissionID?: string;
};

export type RolePermissionsResponse = {
  data?: RoleSubMenuPermission[];
};
