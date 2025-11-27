import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

const sections = [
  {
    title: '1. Accounts & access',
    body: 'Every user receives their own workspace. Sharing login credentials or scraping API responses is prohibited.',
  },
  {
    title: '2. Billing',
    body: 'Stripe manages subscriptions. Failed payments automatically pause access after 7 days.',
  },
  {
    title: '3. Data usage',
    body: 'Contacts, pipelines, tasks, and automations are stored in Neon (EU-West) with daily backups.',
  },
];

export const TermsPage = () => {
  const seo = seoContent['/terms'];
  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/terms" />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
        <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>
        <div className="mt-10 space-y-6 text-sm text-slate-700">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-2">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

