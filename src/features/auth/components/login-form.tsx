import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { FormField } from '../../../shared/components/ui/form-field';
import { Input } from '../../../shared/components/ui/input';
import { loginSchema, type LoginInput } from '../schemas/login.schema';

type LoginFormProps = {
  onSubmit: (data: LoginInput) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
};

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  return (
    <Card className="w-full max-w-md border-violet-100/60 shadow-xl shadow-violet-200/20">
      <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-t-2xl border-b-0">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-violet-100">Sign in to access your admin dashboard.</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Email or Username"
            htmlFor="username"
            hint="Use your account identifier"
            error={errors.username?.message}
          >
            <Input id="username" autoComplete="username" placeholder="you@example.com" {...register('username')} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          </FormField>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
