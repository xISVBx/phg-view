import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../../shared/lib/cn';
import type { RolePermissionSetItem, SecurityMenuItem, SecurityPermissionItem, SecuritySubMenuItem } from '../types/users.types';

type PermissionsEditorProps = {
  menus: SecurityMenuItem[];
  subMenus: SecuritySubMenuItem[];
  permissions: SecurityPermissionItem[];
  value: RolePermissionSetItem[];
  onChange: (next: RolePermissionSetItem[]) => void;
  disabled?: boolean;
};

function uniquePermissionIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function matchQuery(parts: Array<string | undefined>, query: string): boolean {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return parts.some((part) => (part ?? '').toLowerCase().includes(normalized));
}

export function PermissionsEditor({ menus, subMenus, permissions, value, onChange, disabled = false }: PermissionsEditorProps) {
  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [activeSubMenuId, setActiveSubMenuId] = useState<string>('');
  const [manualMenuIds, setManualMenuIds] = useState<Set<string>>(new Set());

  const [menuQuery, setMenuQuery] = useState('');
  const [subMenuQuery, setSubMenuQuery] = useState('');
  const [permissionQuery, setPermissionQuery] = useState('');

  const subMenusByMenu = useMemo(() => {
    const map = new Map<string, SecuritySubMenuItem[]>();
    for (const subMenu of subMenus) {
      if (!map.has(subMenu.menuId)) map.set(subMenu.menuId, []);
      map.get(subMenu.menuId)?.push(subMenu);
    }
    return map;
  }, [subMenus]);

  const assignmentsBySubMenu = useMemo(() => {
    const map = new Map<string, RolePermissionSetItem>();
    value.forEach((item) => map.set(item.subMenuId, item));
    return map;
  }, [value]);

  const inferredMenuIds = useMemo(() => {
    const ids = new Set<string>();
    value.forEach((item) => ids.add(item.menuId));
    return ids;
  }, [value]);

  const enabledMenuIds = useMemo(() => {
    const ids = new Set<string>(manualMenuIds);
    inferredMenuIds.forEach((id) => ids.add(id));
    return ids;
  }, [inferredMenuIds, manualMenuIds]);

  const filteredMenus = useMemo(
    () => menus.filter((menu) => matchQuery([menu.name, menu.code], menuQuery)),
    [menus, menuQuery],
  );

  const visibleSubMenus = useMemo(() => {
    if (!activeMenuId) return [];
    const base = subMenusByMenu.get(activeMenuId) ?? [];
    return base.filter((subMenu) => matchQuery([subMenu.name, subMenu.code], subMenuQuery));
  }, [activeMenuId, subMenuQuery, subMenusByMenu]);

  const filteredPermissions = useMemo(
    () => permissions.filter((permission) => matchQuery([permission.name, permission.code], permissionQuery)),
    [permissions, permissionQuery],
  );

  const activeAssignment = assignmentsBySubMenu.get(activeSubMenuId);
  const activePermissionIds = new Set(activeAssignment?.permissionIds ?? []);
  const activeSubMenuEnabled = Boolean(activeAssignment);

  useEffect(() => {
    setManualMenuIds(new Set(inferredMenuIds));
  }, [inferredMenuIds]);

  useEffect(() => {
    if (!activeMenuId && filteredMenus.length > 0) {
      setActiveMenuId(filteredMenus[0].id);
    }

    if (filteredMenus.length > 0 && !filteredMenus.some((menu) => menu.id === activeMenuId)) {
      setActiveMenuId(filteredMenus[0].id);
    }
  }, [activeMenuId, filteredMenus]);

  useEffect(() => {
    if (!activeMenuId) return;

    const currentSubMenus = (subMenusByMenu.get(activeMenuId) ?? []).filter((subMenu) =>
      matchQuery([subMenu.name, subMenu.code], subMenuQuery),
    );

    if (currentSubMenus.length === 0) {
      setActiveSubMenuId('');
      return;
    }

    const stillVisible = currentSubMenus.some((subMenu) => subMenu.id === activeSubMenuId);
    if (!stillVisible) {
      setActiveSubMenuId(currentSubMenus[0].id);
    }
  }, [activeMenuId, activeSubMenuId, subMenuQuery, subMenusByMenu]);

  const toggleMenu = (menuId: string, checked: boolean) => {
    const nextManual = new Set(manualMenuIds);
    if (checked) nextManual.add(menuId);
    if (!checked) nextManual.delete(menuId);
    setManualMenuIds(nextManual);

    if (!checked) {
      const next = value.filter((item) => item.menuId !== menuId);
      onChange(next);

      if (activeMenuId === menuId) {
        setActiveSubMenuId('');
      }
    }
  };

  const toggleSubMenu = (subMenu: SecuritySubMenuItem, checked: boolean) => {
    if (!enabledMenuIds.has(subMenu.menuId) && checked) return;

    const next = value.filter((item) => item.subMenuId !== subMenu.id);
    if (checked) {
      next.push({
        menuId: subMenu.menuId,
        subMenuId: subMenu.id,
        permissionIds: assignmentsBySubMenu.get(subMenu.id)?.permissionIds ?? [],
      });
      setActiveMenuId(subMenu.menuId);
      setActiveSubMenuId(subMenu.id);
    } else if (activeSubMenuId === subMenu.id) {
      const fallback = (subMenusByMenu.get(subMenu.menuId) ?? []).find((item) => item.id !== subMenu.id);
      setActiveSubMenuId(fallback?.id ?? '');
    }

    onChange(next);
  };

  const togglePermission = (permissionId: string, checked: boolean) => {
    if (!activeSubMenuId) return;
    const current = assignmentsBySubMenu.get(activeSubMenuId);
    if (!current) return;

    const nextIds = checked
      ? uniquePermissionIds([...current.permissionIds, permissionId])
      : current.permissionIds.filter((id) => id !== permissionId);

    const next = value.map((item) =>
      item.subMenuId === activeSubMenuId
        ? {
            ...item,
            permissionIds: nextIds,
          }
        : item,
    );

    onChange(next);
  };

  const selectAllFilteredPermissions = () => {
    if (!activeSubMenuId) return;
    const current = assignmentsBySubMenu.get(activeSubMenuId);
    if (!current) return;

    const nextIds = uniquePermissionIds([...current.permissionIds, ...filteredPermissions.map((permission) => permission.id)]);

    const next = value.map((item) =>
      item.subMenuId === activeSubMenuId
        ? {
            ...item,
            permissionIds: nextIds,
          }
        : item,
    );

    onChange(next);
  };

  const clearActiveSubMenuPermissions = () => {
    if (!activeSubMenuId) return;
    const current = assignmentsBySubMenu.get(activeSubMenuId);
    if (!current) return;

    const next = value.map((item) =>
      item.subMenuId === activeSubMenuId
        ? {
            ...item,
            permissionIds: [],
          }
        : item,
    );

    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        <section className="p-3">
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">Menus</h5>
          <input
            value={menuQuery}
            onChange={(event) => setMenuQuery(event.target.value)}
            placeholder="Filter menus..."
            className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            {filteredMenus.map((menu) => {
              const checked = enabledMenuIds.has(menu.id);
              const active = activeMenuId === menu.id;

              return (
                <div key={menu.id} className={cn('flex items-center gap-2 rounded-lg border p-2', active ? 'border-violet-300 bg-violet-50/50' : 'border-slate-200 bg-white')}>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setActiveMenuId(menu.id)}
                  >
                    <p className="truncate text-sm font-medium text-slate-800">{menu.name}</p>
                    <p className="truncate text-xs text-slate-500">{menu.code}</p>
                  </button>

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => toggleMenu(menu.id, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>
              );
            })}

            {filteredMenus.length === 0 ? <p className="text-xs text-slate-500">No menus found.</p> : null}
          </div>
        </section>

        <section className="p-3">
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">Submenus</h5>
          <input
            value={subMenuQuery}
            onChange={(event) => setSubMenuQuery(event.target.value)}
            placeholder="Filter submenus..."
            className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            {visibleSubMenus.length === 0 ? <p className="text-xs text-slate-500">Select a menu to see submenus.</p> : null}

            {visibleSubMenus.map((subMenu) => {
              const checked = assignmentsBySubMenu.has(subMenu.id);
              const active = activeSubMenuId === subMenu.id;
              const count = assignmentsBySubMenu.get(subMenu.id)?.permissionIds.length ?? 0;
              const blockedByMenu = !enabledMenuIds.has(subMenu.menuId);

              return (
                <div
                  key={subMenu.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-2',
                    active ? 'border-violet-300 bg-violet-50/50' : 'border-slate-200 bg-white',
                    blockedByMenu && 'opacity-50',
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setActiveSubMenuId(subMenu.id)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">{subMenu.name}</p>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{count}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{subMenu.code}</p>
                  </button>

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || blockedByMenu}
                    onChange={(event) => toggleSubMenu(subMenu, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-violet-700">Permissions</h5>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700 disabled:opacity-50"
                disabled={disabled || !activeSubMenuEnabled || filteredPermissions.length === 0}
                onClick={selectAllFilteredPermissions}
              >
                Select all
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 disabled:opacity-50"
                disabled={disabled || !activeSubMenuEnabled}
                onClick={clearActiveSubMenuPermissions}
              >
                Clear
              </button>
            </div>
          </div>

          <input
            value={permissionQuery}
            onChange={(event) => setPermissionQuery(event.target.value)}
            placeholder="Filter permissions..."
            className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          <div className="mb-2 text-[11px] text-slate-500">Shown for selected submenu.</div>

          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            {!activeSubMenuId ? <p className="text-xs text-slate-500">Select a submenu to manage permissions.</p> : null}
            {activeSubMenuId && !activeSubMenuEnabled ? <p className="text-xs text-slate-500">Enable this submenu first.</p> : null}

            {filteredPermissions.map((permission) => {
              const checked = activePermissionIds.has(permission.id);
              return (
                <div key={permission.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => void 0}>
                    <p className="truncate text-sm font-medium text-slate-800">{permission.name}</p>
                    <p className="truncate text-xs text-slate-500">{permission.code}</p>
                  </button>

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || !activeSubMenuEnabled}
                    onChange={(event) => togglePermission(permission.id, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>
              );
            })}

            {filteredPermissions.length === 0 ? <p className="text-xs text-slate-500">No permissions found.</p> : null}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Assigned submenu groups: <span className="font-semibold text-slate-900">{value.length}</span>
      </div>
    </div>
  );
}
