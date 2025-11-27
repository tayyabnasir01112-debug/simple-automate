import { useState } from 'react';
import type { FormEvent } from 'react';
import { Seo } from '../../components/seo/Seo';
import { api } from '../../lib/api';

export const ResetPasswordPage = () => {
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/auth/password-reset-request', { email: form.get('email') });
    setRequested(true);
    setMessage('We emailed you a reset token. Paste it below once received.');
  };

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/auth/password-reset', {
      token: form.get('token'),
      password: form.get('password'),
    });
    setMessage('Password updated. You can now log in.');
  };

  return (
    <>
      <Seo title="Reset password · SimpleAutomate" description="Reset your account password" path="/reset-password" />
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the email linked to your workspace. We will send a secure reset token.
          </p>
          <form onSubmit={requestReset} className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
              />
            </label>
            <button className="mt-4 w-full rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:border-brand hover:text-brand">
              Email reset link
            </button>
          </form>

          {requested && (
            <form onSubmit={submitReset} className="mt-8">
              <label className="block text-sm font-medium text-slate-700">
                Token
                <input
                  name="token"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                New password
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>
              <button className="mt-4 w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
                Update password
              </button>
            </form>
          )}

          {message && <p className="mt-4 text-sm text-brand">{message}</p>}
        </div>
      </section>
    </>
  );
};

