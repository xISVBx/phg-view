import { useEffect } from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { AppLayout } from '../layouts/app-layout';
import { LazyPage, lazyPage } from './lazy-page';
import { moduleRoutes } from './module-routes';

const LoginPage = lazyPage(() => import('../../features/auth/pages/login-page'), 'LoginPage');
const DashboardPage = lazyPage(() => import('../../pages/dashboard-page'), 'DashboardPage');
const WorkspacePage = lazyPage(() => import('../../pages/workspace-page'), 'WorkspacePage');

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
    element: <LazyPage component={LoginPage} />,
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
            element: <LazyPage component={DashboardPage} />,
          },
          ...moduleRoutes,
          {
            path: '/workspace/:menuCode/:subMenuCode',
            element: <LazyPage component={WorkspacePage} />,
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
