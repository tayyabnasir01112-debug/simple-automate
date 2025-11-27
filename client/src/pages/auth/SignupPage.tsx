import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { useAuth } from '../../providers/AuthProvider';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await signup({
        email: data.get('email') as string,
        password: data.get('password') as string,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Start free trial · SimpleAutomate" description="Create your workspace in minutes" path="/signup" />
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-card"
        >
          <h1 className="text-2xl font-bold text-slate-900">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-600">7-day free trial, £5/mo afterwards.</p>
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Work email
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
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {isSubmitting ? 'Creating workspace...' : 'Start free trial'}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <p className="mt-4 text-center text-sm text-slate-600">
            Already using SimpleAutomate?{' '}
            <Link to="/login" className="text-brand">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </>
  );
};

