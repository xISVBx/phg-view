import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/auth.store';
import { Card, CardContent, CardHeader } from '../shared/components/ui/card';

export function WorkspacePage() {
  const { menuCode, subMenuCode } = useParams();
  const user = useAuthStore((state) => state.user);

  const selectedSubMenu = useMemo(() => {
    const menu = user?.permissions?.find((item) => item.menuCode === menuCode || item.menuName === menuCode);
    return menu?.subMenus?.find((sub) => sub.subMenuCode === subMenuCode || sub.subMenuName === subMenuCode);
  }, [menuCode, subMenuCode, user?.permissions]);

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{decodeURIComponent(subMenuCode ?? 'Submenu')}</h1>
        <p className="mt-1 text-sm text-slate-600">Fallback route for submenu codes without explicit mapping yet.</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Menu code:</span> {decodeURIComponent(menuCode ?? '')}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Submenu code:</span> {decodeURIComponent(subMenuCode ?? '')}
            </p>
          </div>

          <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Permissions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(selectedSubMenu?.permissions ?? []).length === 0 ? (
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-500">No permissions listed</span>
              ) : (
                selectedSubMenu?.permissions?.map((permission) => (
                  <span key={permission} className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700">
                    {permission}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
