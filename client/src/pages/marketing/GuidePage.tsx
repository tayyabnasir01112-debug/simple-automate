import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { UsageTips } from '../../components/help/UsageTips';

const sections = [
  {
    title: '1. Invite your team',
    body: 'Add teammates under Settings → Workspace so every pipeline update is visible.',
  },
  {
    title: '2. Configure your pipeline',
    body: 'Rename stages to match your sales process and drag cards on the board as deals progress.',
  },
  {
    title: '3. Capture context with notes',
    body: 'Use markdown notes inside each contact. Every edit is revision-safe and viewable in history.',
  },
  {
    title: '4. Automate follow-ups',
    body: 'Launch a simple nurture automation. Combine email, delays, tag changes, and stage moves.',
  },
  {
    title: '5. Broadcast your wins',
    body: 'Use campaigns for newsletters and announcements. Analytics show sent/opened/clicked metrics.',
  },
];

export const GuidePage = () => (
  <>
    <Seo title="Guide · SimpleAutomate" description="Learn how to get up and running in minutes." path="/guide" />
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-brand">Help center</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Getting started</h1>
      <p className="mt-4 text-slate-600">
        This guide highlights the fastest path to value. For the full handbook, see{' '}
        <a href="https://github.com/tayyabnasir01112-debug/simple-automate/blob/main/docs/help-center.md" className="text-brand underline">
          docs/help-center.md
        </a>
        .
      </p>
      <div className="mt-8 space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
        <Link to="/contact" className="text-brand underline">
          Contact support
        </Link>
        <a href="mailto:hello@simpleautomate.co.uk" className="text-brand underline">
          hello@simpleautomate.co.uk
        </a>
      </div>
    </section>
    <UsageTips context="marketing" />
  </>
);

