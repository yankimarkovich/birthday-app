import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/useAuth';
import { api } from '@/lib/axios';
import type { AuthResponse } from '@/types';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AuthLayout from '@/components/AuthLayout';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', values);
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      form.setError('root', { message });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout title="Register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthLayout>
  );
}
