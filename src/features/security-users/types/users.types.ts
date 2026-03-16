export type UserItem = {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  roles?: UserRoleDetail[];
};

export type UserRolePermission = {
  id: string;
  code?: string;
  name?: string;
};

export type UserRoleSubMenu = {
  id: string;
  code?: string;
  name?: string;
  permissions?: UserRolePermission[];
};

export type UserRoleMenu = {
  id: string;
  code?: string;
  name?: string;
  subMenus?: UserRoleSubMenu[];
};

export type UserRoleDetail = {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  menus?: UserRoleMenu[];
};

export type RolePermissionSetItem = {
  menuId: string;
  subMenuId: string;
  permissionIds: string[];
};

export type SecurityMenuItem = {
  id: string;
  name: string;
  code?: string;
};

export type SecuritySubMenuItem = {
  id: string;
  menuId: string;
  name: string;
  code?: string;
};

export type SecurityPermissionItem = {
  id: string;
  name: string;
  code?: string;
};

export type UsersListResponse = {
  data?: UserItem[];
  meta?: {
    total?: number;
  };
};

export type CreateUserPayload = {
  username: string;
  fullName: string;
  password: string;
  roleId: string;
  permissions: RolePermissionSetItem[];
  email?: string;
  phone?: string;
};

export type UpdateUserPayload = {
  fullName: string;
  roleId: string;
  permissions: RolePermissionSetItem[];
  email?: string;
  phone?: string;
  isActive?: boolean;
};

export type UserResponse = {
  data?: UserItem;
};

export type UsersQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type UserRoleItem = {
  roleID?: string;
  roleId?: string;
  isPrimary?: boolean;
};

export type UserRolesResponse = {
  data?: UserRoleItem[];
};
