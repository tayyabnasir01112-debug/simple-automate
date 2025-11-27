import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';
import { api } from '../../lib/api';

const inclusions = [
  'Unlimited contacts & pipelines',
  'Automation builder + Render cron jobs',
  'Email templates & bulk campaigns',
  'Stripe subscription management',
  'Neon Postgres storage (encrypted)',
];

export const PricingPage = () => {
  const seo = seoContent['/pricing'];
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const origin = window.location.origin;
      const { data } = await api.post<{ url: string }>('/billing/checkout', {
        successUrl: `${origin}/settings?checkout=success`,
        cancelUrl: `${origin}/pricing?checkout=cancelled`,
      });
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setMessage('Unable to start checkout right now. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/pricing" />
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
        <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-widest text-brand">Simple plan</p>
          <div className="mt-4 text-5xl font-bold text-slate-900">
            £5 <span className="text-lg font-medium text-slate-500">/month</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">7-day free trial · Cancel anytime</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            {inclusions.map((item) => (
              <li key={item} className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-brand px-6 py-3 text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? 'Starting checkout…' : 'Start your free trial'}
          </button>
          <Link to="/signup" className="mt-3 block text-sm text-brand">
            Prefer to activate later? Create an account first.
          </Link>
          {message && <p className="mt-3 text-sm text-red-500">{message}</p>}
        </div>
      </section>
    </>
  );
};

