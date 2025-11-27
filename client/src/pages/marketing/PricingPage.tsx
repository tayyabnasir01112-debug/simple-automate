import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

const inclusions = [
  'Unlimited contacts & pipelines',
  'Automation builder + Render cron jobs',
  'Email templates & bulk campaigns',
  'Stripe subscription management',
  'Neon Postgres storage (encrypted)',
];

export const PricingPage = () => {
  const seo = seoContent['/pricing'];

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
          <Link
            to="/signup"
            className="mt-8 block rounded-full bg-brand px-6 py-3 text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
          >
            Start your free trial
          </Link>
        </div>
      </section>
    </>
  );
};

