import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

const heroStats = [
  { label: 'Contacts managed', value: '14k+' },
  { label: 'Automations running', value: '320' },
  { label: 'Avg. response boost', value: '27%' },
];

const featureList = [
  {
    title: 'Unified CRM workspace',
    body: 'View contacts, notes, tasks, and pipeline stages in one responsive canvas with instant search.',
  },
  {
    title: 'Automation studio',
    body: 'Build multi-step sequences with emails, delays, tag updates, and pipeline moves without code.',
  },
  {
    title: 'Email campaigns',
    body: 'Schedule broadcasts, reuse templates, and review sent/opened/clicked analytics at a glance.',
  },
];

export const HomePage = () => {
  const seo = seoContent['/'];

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/" />
      <section className="mx-auto max-w-6xl px-6 py-16 text-center lg:py-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
          Built for modern agencies
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {seo.hero.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">{seo.hero.subheading}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="w-full rounded-full bg-brand px-6 py-3 text-center text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark sm:w-auto"
          >
            Start 7-day free trial
          </Link>
          <Link
            to="/features/crm"
            className="w-full rounded-full border border-slate-200 px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-brand hover:text-brand sm:w-auto"
          >
            Explore features
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-card">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-light">
              CRM + Automation + Email
            </p>
            <h2 className="text-3xl font-bold">Every workflow you need, minus the clutter.</h2>
            <p className="text-slate-300">
              Build pipelines per workspace, launch date-driven automations, and review insights that stay
              fast even with 200 active users.
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              {seo.bullets?.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white/5 p-6 shadow-2xl shadow-black/30">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
              alt="SimpleAutomate dashboard preview"
              className="rounded-2xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {featureList.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand/5 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Testimonials</p>
          <blockquote className="mt-6 text-2xl font-semibold text-slate-900">
            “We replaced a stack of three tools with SimpleAutomate, kept all of our contacts synced, and
            finally have automations that the whole team understands.”
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">— Isla Gray, Contour Studio</p>
        </div>
      </section>
    </>
  );
};

