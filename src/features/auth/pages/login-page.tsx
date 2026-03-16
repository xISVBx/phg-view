import { Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/login-form';
import { useAuthStore } from '../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.16),transparent_40%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium tracking-wide text-violet-700">PHOTO GALLERY ADMIN</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Secure Access Portal</h2>
          <p className="mt-2 text-sm text-slate-600">Clean, secure access for your business operations.</p>
        </div>

        <LoginForm
          isLoading={isLoading}
          error={error}
          onSubmit={async (values) => {
            await login(values);
            navigate('/dashboard', { replace: true });
          }}
        />
      </div>
    </main>
  );
}
