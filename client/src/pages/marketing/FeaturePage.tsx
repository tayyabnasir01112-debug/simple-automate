import { Seo } from '../../components/seo/Seo';
import { seoContent } from '../../lib/seo';

type Props = {
  path: '/features/crm' | '/features/automation' | '/features/email-marketing' | '/features/pipelines';
};

const highlights = {
  '/features/crm': ['Contact timelines', 'Markdown notes', 'Task reminders'],
  '/features/automation': ['Trigger builder', 'Reusable steps', 'Detailed logs'],
  '/features/email-marketing': ['Templates', 'Segments', 'Engagement stats'],
  '/features/pipelines': ['Drag and drop', 'Per-user pipelines', 'Stage automation triggers'],
} as const;

export const FeaturePage = ({ path }: Props) => {
  const seo = seoContent[path];

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={path} />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">{seo.hero.heading}</h1>
        <p className="mt-4 text-lg text-slate-600">{seo.hero.subheading}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights[path].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <p className="text-lg font-semibold text-slate-900">{item}</p>
              <p className="mt-2 text-sm text-slate-600">
                {seo.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

