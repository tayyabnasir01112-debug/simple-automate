import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

const policies = [
  {
    title: 'Data collection',
    items: [
      'Contact records, automation logs, and billing identifiers.',
      'Usage analytics limited to anonymised page metrics via Netlify.',
    ],
  },
  {
    title: 'Storage & encryption',
    items: [
      'Neon Postgres with daily backups.',
      'JWT secrets, Stripe keys, and Resend keys stored as Render/Netlify environment variables.',
    ],
  },
  {
    title: 'Your rights',
    items: ['Export contacts anytime', 'Request deletion within 24 hours', 'Revoke email tracking'],
  },
];

export const PrivacyPage = () => {
  const seo = seoContent['/privacy'];
  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/privacy" />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
        <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>
        <div className="mt-10 space-y-6">
          {policies.map((policy) => (
            <div key={policy.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h2 className="text-xl font-semibold text-slate-900">{policy.title}</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-slate-600">
                {policy.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

