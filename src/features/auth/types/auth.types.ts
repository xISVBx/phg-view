export type MeRole = {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  isPrimary?: boolean;
};

export type EffectiveSubMenu = {
  subMenuCode?: string;
  subMenuName?: string;
  permissions?: string[];
};

export type EffectivePermissionNode = {
  menuCode?: string;
  menuName?: string;
  subMenus?: EffectiveSubMenu[];
};

export type AuthUser = {
  id?: string | number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  isActive?: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  name?: string;
  roles?: MeRole[];
  permissions?: EffectivePermissionNode[];
  [key: string]: unknown;
};

export type LoginResult = {
  token: string;
  refreshToken: string | null;
  user?: AuthUser;
  raw: unknown;
};
