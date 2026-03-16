import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { Button } from '../../shared/components/ui/button';
import { getModuleRouteDef, resolveSubMenuPath } from '../router/navigation';

function decodeSegment(value: string | undefined): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.fullName ?? user?.name ?? user?.username ?? 'Unknown User';
  const primaryRole = useMemo(
    () => user?.roles?.find((role) => role.isPrimary)?.name ?? user?.roles?.[0]?.name ?? 'No role assigned',
    [user?.roles],
  );

  const menuNodes = user?.permissions ?? [];

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const workspaceMenuCode = pathSegments[0] === 'workspace' ? decodeSegment(pathSegments[1]) : '';
  const workspaceSubMenuCode = pathSegments[0] === 'workspace' ? decodeSegment(pathSegments[2]) : '';

  const activePair = useMemo(() => {
    for (const menu of menuNodes) {
      for (const subMenu of menu.subMenus ?? []) {
        const targetPath = resolveSubMenuPath(menu.menuCode, subMenu.subMenuCode);
        const isDirectMatch = targetPath === location.pathname;
        const isNestedMatch = location.pathname.startsWith(`${targetPath}/`);

        if (isDirectMatch || isNestedMatch) {
          return { menuCode: menu.menuCode, subMenuCode: subMenu.subMenuCode };
        }

        if (
          pathSegments[0] === 'workspace' &&
          (menu.menuCode === workspaceMenuCode || menu.menuName === workspaceMenuCode) &&
          (subMenu.subMenuCode === workspaceSubMenuCode || subMenu.subMenuName === workspaceSubMenuCode)
        ) {
          return { menuCode: menu.menuCode, subMenuCode: subMenu.subMenuCode };
        }
      }
    }

    return {
      menuCode: menuNodes[0]?.menuCode,
      subMenuCode: menuNodes[0]?.subMenus?.[0]?.subMenuCode,
    };
  }, [location.pathname, menuNodes, pathSegments, workspaceMenuCode, workspaceSubMenuCode]);

  const selectedMenu = menuNodes.find((menu) => menu.menuCode === activePair.menuCode) ?? menuNodes[0];
  const selectedSubMenu = selectedMenu?.subMenus?.find((subMenu) => subMenu.subMenuCode === activePair.subMenuCode) ?? selectedMenu?.subMenus?.[0];
  const selectedMenuPath = selectedMenu?.subMenus?.[0] ? resolveSubMenuPath(selectedMenu.menuCode, selectedMenu.subMenus[0].subMenuCode) : '/dashboard';
  const selectedSubMenuPath = selectedSubMenu ? resolveSubMenuPath(selectedMenu?.menuCode, selectedSubMenu.subMenuCode) : '/dashboard';
  const isNestedSubMenuAccess = selectedSubMenuPath !== '/dashboard' && location.pathname.startsWith(`${selectedSubMenuPath}/`);
  const nestedPath = isNestedSubMenuAccess ? location.pathname.slice(selectedSubMenuPath.length + 1) : '';
  const nestedRouteDef = nestedPath ? getModuleRouteDef(`${selectedSubMenuPath}/${nestedPath}`) : undefined;
  const nestedAccessLabel =
    nestedRouteDef?.title ??
    nestedPath
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-slate-200 bg-white/95 p-5 shadow-sm">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 p-5 text-white shadow-lg shadow-violet-300/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">Photo Gallery</p>
            <h1 className="mt-2 text-lg font-semibold leading-tight">Control Center</h1>
            <p className="mt-1 text-sm text-violet-100">{displayName}</p>
            <p className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-violet-50">{primaryRole}</p>
          </div>

          <nav className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
            {menuNodes.length === 0 ? <p className="text-sm text-slate-500">No menus available for this user.</p> : null}

            {menuNodes.map((menu) => {
              const isActiveMenu = selectedMenu?.menuCode === menu.menuCode;
              return (
                <div key={menu.menuCode ?? menu.menuName} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2">
                  <button
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      isActiveMenu ? 'bg-violet-100 text-violet-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => {
                      const firstSubMenu = menu.subMenus?.[0];
                      if (firstSubMenu) {
                        navigate(resolveSubMenuPath(menu.menuCode, firstSubMenu.subMenuCode));
                        return;
                      }
                      navigate('/dashboard');
                    }}
                  >
                    <span>{menu.menuName ?? menu.menuCode ?? 'Menu'}</span>
                    <span className="text-xs text-slate-500">{menu.subMenus?.length ?? 0}</span>
                  </button>

                  <div className="mt-1 space-y-1 pl-2">
                    {menu.subMenus?.map((subMenu) => {
                      const targetPath = resolveSubMenuPath(menu.menuCode, subMenu.subMenuCode);
                      const isActiveSub = targetPath === location.pathname || location.pathname.startsWith(`${targetPath}/`);

                      return (
                        <button
                          key={subMenu.subMenuCode ?? subMenu.subMenuName}
                          className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                            isActiveSub ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                          }`}
                          onClick={() => {
                            navigate(targetPath);
                          }}
                        >
                          {subMenu.subMenuName ?? subMenu.subMenuCode ?? 'Submenu'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="p-6 md:p-8">
          <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Current Access</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                <button
                  className="rounded-full bg-slate-100 px-3 py-1.5 transition hover:bg-slate-200"
                  onClick={() => navigate(selectedMenuPath)}
                >
                  {selectedMenu?.menuName ?? 'No menu selected'}
                </button>
                {selectedSubMenu?.subMenuName ? (
                  <>
                    <span className="text-slate-400">/</span>
                    <button
                      className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700 transition hover:bg-violet-100"
                      onClick={() => navigate(selectedSubMenuPath)}
                    >
                      {selectedSubMenu.subMenuName}
                    </button>
                  </>
                ) : null}
                {nestedAccessLabel ? (
                  <>
                    <span className="text-slate-400">/</span>
                    <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">{nestedAccessLabel}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isNestedSubMenuAccess ? (
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-500 hover:to-fuchsia-500"
                  onClick={() => navigate(selectedSubMenuPath)}
                >
                  <span aria-hidden="true">←</span>
                  Volver a {selectedSubMenu?.subMenuName ?? 'submenu'}
                </button>
              ) : null}
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>

          <Outlet />
        </section>
      </div>
    </main>
  );
}
