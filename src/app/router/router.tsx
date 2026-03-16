import { useEffect } from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/login-page';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { DashboardPage } from '../../pages/dashboard-page';
import { WorkspacePage } from '../../pages/workspace-page';
import { AppLayout } from '../layouts/app-layout';
import { moduleRoutes } from './module-routes';

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrateUser = useAuthStore((state) => state.hydrateUser);

  useEffect(() => {
    if (token) {
      void hydrateUser();
    }
  }, [token, hydrateUser]);

  if (isHydrating) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">
        Validating session...
      </main>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          ...moduleRoutes,
          {
            path: '/workspace/:menuCode/:subMenuCode',
            element: <WorkspacePage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
