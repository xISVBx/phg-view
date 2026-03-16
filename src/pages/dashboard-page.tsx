import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../shared/components/ui/card';
import { useAuthStore } from '../features/auth/store/auth.store';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.fullName ?? user?.name ?? user?.username ?? 'Unknown User';
  const primaryRole = useMemo(
    () => user?.roles?.find((role) => role.isPrimary)?.name ?? user?.roles?.[0]?.name ?? 'No role assigned',
    [user?.roles],
  );

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Home</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Session Overview</h1>
        <p className="mt-1 text-sm text-slate-600">Detalle principal de tu perfil autenticado.</p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Primary Role</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{primaryRole}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{user?.email ?? 'Not available'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{displayName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
