import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

export const AboutPage = () => {
  const seo = seoContent['/about'];

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/about" />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
        <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-900">Why SimpleAutomate?</h2>
            <p className="mt-3 text-sm text-slate-600">
              We wanted a CRM that respected lean teams—no bloat, no enterprise licensing, and no confusing
              automation logic to maintain.
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm text-slate-600">
              <li>Built for ~200 active users running on free-tier infrastructure.</li>
              <li>Resilient background automation powered by Render Cron.</li>
              <li>Audit-friendly Postgres schema deployed to Neon.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-900">Principles</h2>
            <ol className="mt-4 list-decimal pl-5 text-sm text-slate-600 space-y-2">
              <li>Clarity over cleverness—surface data your team needs today.</li>
              <li>Automation transparency—every step logged with timestamps.</li>
              <li>Predictable billing—£5/mo, always.</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
};

