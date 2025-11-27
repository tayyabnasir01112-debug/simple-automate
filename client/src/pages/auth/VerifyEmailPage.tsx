import { useState } from 'react';
import type { FormEvent } from 'react';
import { Seo } from '../../components/seo/Seo';
import { api } from '../../lib/api';

export const VerifyEmailPage = () => {
  const [status, setStatus] = useState<string | null>(null);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/auth/verify', { token: form.get('token') });
    setStatus('Email verified! You can close this tab.');
  };

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post('/auth/verify-request', { email: form.get('email') });
    setStatus('Verification link sent.');
  };

  return (
    <>
      <Seo title="Verify your email · SimpleAutomate" description="Confirm your workspace email" path="/verify-email" />
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
            <p className="mt-2 text-sm text-slate-600">
              Paste the verification token from your inbox or resend a new link.
            </p>
            <form onSubmit={handleVerify} className="mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Token
                <input
                  name="token"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>
              <button className="mt-4 w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
                Verify email
              </button>
            </form>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-700">Need a new link?</p>
            <form onSubmit={handleResend} className="mt-3">
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
              />
              <button className="mt-3 w-full rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:border-brand hover:text-brand">
                Resend email
              </button>
            </form>
          </div>
          {status && <p className="text-center text-sm text-brand">{status}</p>}
        </div>
      </section>
    </>
  );
};

