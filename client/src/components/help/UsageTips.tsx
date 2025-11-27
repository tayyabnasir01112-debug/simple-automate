type UsageTipsProps = {
  context?: 'marketing' | 'app';
};

const baseCards = [
  {
    title: 'Using SimpleAutomate on desktop',
    bullets: [
      'Left navigation keeps CRM, automations, and settings one click away.',
      'Drag deals across pipeline columns or open any contact to pin notes, tasks, and automations.',
      'Docs & help center live under the question mark menu for quick walkthroughs.',
    ],
  },
  {
    title: 'Using SimpleAutomate on your phone',
    bullets: [
      'Tap the menu icon to switch between dashboard, contacts, and campaigns.',
      'Cards collapse into swipe-friendly stacks—tap any contact to open notes and tasks.',
      'Use the floating “+” buttons to add contacts, notes, and tasks while on the go.',
    ],
  },
];

const appExtras = {
  desktop: [
    'Command/CTRL + K opens quick search so you can jump to contacts without leaving the keyboard.',
    'Resize stages freely—the board automatically snaps back into a readable grid.',
  ],
  mobile: [
    'The chip navigation under the workspace header acts as a tab bar on phones.',
    'Long-press a contact to move it between stages without opening the drawer.',
  ],
};

const marketingExtras = {
  desktop: [
    'Start with the 7-day free trial—the onboarding checklist guides you from contacts to automations.',
    'Each plan includes unlimited pipelines so you can mirror sales and success workflows.',
  ],
  mobile: [
    'Marketing pages use the same responsive layout as the app, so every CTA and form is thumb-friendly.',
    'Add SimpleAutomate to your phone’s home screen for an app-like experience.',
  ],
};

export const UsageTips = ({ context = 'marketing' }: UsageTipsProps) => {
  const cards = [...baseCards];
  const extras = context === 'app' ? appExtras : marketingExtras;

  cards[0] = { ...cards[0], bullets: [...cards[0].bullets, ...extras.desktop] };
  cards[1] = { ...cards[1], bullets: [...cards[1].bullets, ...extras.mobile] };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brand">How to use it</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Clear instructions for web and phone
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Everything is designed to work the same way whether you’re in a browser tab or on your phone.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-card backdrop-blur"
          >
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

