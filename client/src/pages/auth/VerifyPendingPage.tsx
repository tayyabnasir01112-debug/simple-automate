import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../lib/api';
import { Seo } from '../../components/seo/Seo';

export const VerifyPendingPage = () => {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const email = user?.email ?? 'your email';

  const handleResend = async () => {
    try {
      await api.post('/auth/verify-request', { email });
      setStatus('Verification email sent. Check your inbox.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to send email. Please try again shortly.');
    }
  };

  const handleRefresh = async () => {
    await refreshProfile();
    if (user?.emailVerified) {
      navigate('/dashboard', { replace: true });
    } else {
      setStatus('Still waiting for verification. Once you click the email link, press this button again.');
    }
  };

  return (
    <>
      <Seo title="Verify your email · SimpleAutomate" description="Confirm your SimpleAutomate workspace email." path="/verify-pending" />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">One more step</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Verify your email</h1>
          <p className="mt-4 text-sm text-slate-600">
            We sent a verification link to <span className="font-semibold">{email}</span>. Please click the link in your inbox to activate your workspace.
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={handleResend}
              className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
            >
              Resend verification email
            </button>
            <button
              onClick={handleRefresh}
              className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              I’ve verified my email
            </button>
          </div>
          {status && <p className="mt-4 text-sm text-slate-500">{status}</p>}
          <button onClick={logout} className="mt-6 text-xs text-slate-500 underline">
            Log out and use a different email
          </button>
        </div>
      </div>
    </>
  );
};

