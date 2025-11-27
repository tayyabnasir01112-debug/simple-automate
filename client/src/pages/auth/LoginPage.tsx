import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { useAuth } from '../../providers/AuthProvider';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    try {
      await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      const redirectPath = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Log in · SimpleAutomate" description="Access your SimpleAutomate workspace" path="/login" />
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-card"
        >
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Log in to manage contacts and automations.</p>
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <div className="mt-3 text-right text-xs">
            <Link to="/reset-password" className="text-brand hover:text-brand-dark">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <p className="mt-4 text-center text-sm text-slate-600">
            Need an account?{' '}
            <Link to="/signup" className="text-brand">
              Start free trial
            </Link>
          </p>
        </form>
      </section>
    </>
  );
};

