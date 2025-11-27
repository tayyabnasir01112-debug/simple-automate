import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

export const SettingsPage = () => {
  const { user, refreshProfile } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const billingMutation = useMutation({
    mutationFn: async () => {
      const base = import.meta.env.VITE_APP_URL || window.location.origin;
      const { data } = await api.post<{ url: string }>('/billing/checkout', {
        successUrl: `${base}/settings?success=true`,
        cancelUrl: `${base}/settings?cancelled=true`,
      });
      window.location.href = data.url;
    },
  });

  const handleVerify = async () => {
    await refreshProfile();
    setMessage('Subscription status refreshed.');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">Subscription</h2>
        <p className="mt-2 text-sm text-slate-600">
          Current plan: <span className="font-semibold uppercase">{user?.subscriptionStatus}</span>
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => billingMutation.mutate()}
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            Update billing via Stripe
          </button>
          <button
            onClick={handleVerify}
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Refresh status
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-brand">{message}</p>}
      </div>
    </div>
  );
};

