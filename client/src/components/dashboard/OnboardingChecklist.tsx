import { Link } from 'react-router-dom';

type ChecklistProps = {
  stats: {
    contactCount: number;
    automationCount: number;
    campaignCount: number;
    templateCount: number;
  };
  emailVerified: boolean;
};

const steps = [
  { id: 'verify', label: 'Verify your email', description: 'Confirm your workspace email so teammates can trust updates.', href: '/verify-pending' },
  { id: 'contact', label: 'Add your first contact', description: 'Import a lead or add a prospect manually.', href: '/contacts' },
  { id: 'automation', label: 'Build an automation', description: 'Create a simple nurture sequence to welcome new leads.', href: '/automations' },
  { id: 'campaign', label: 'Send a newsletter', description: 'Announce something new with a scheduled campaign.', href: '/campaigns' },
];

export const OnboardingChecklist = ({ stats, emailVerified }: ChecklistProps) => {
  const completion: Record<string, boolean> = {
    verify: emailVerified,
    contact: stats.contactCount > 0,
    automation: stats.automationCount > 0,
    campaign: stats.campaignCount > 0,
  };

  const completedCount = Object.values(completion).filter(Boolean).length;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand">Onboarding</p>
          <h2 className="text-lg font-semibold text-slate-900">Get the most from SimpleAutomate</h2>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {completedCount}/{steps.length} done
        </span>
      </div>
      <ol className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.id} className="flex gap-3">
            <span
              className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                completion[step.id] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {completion[step.id] ? '✓' : step.id === 'verify' ? 1 : step.id === 'contact' ? 2 : step.id === 'automation' ? 3 : 4}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{step.label}</p>
              <p className="text-xs text-slate-500">{step.description}</p>
              {!completion[step.id] && (
                <Link to={step.href} className="mt-1 inline-flex text-xs font-semibold text-brand hover:underline">
                  Go to {step.label.toLowerCase()}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

