type SeoEntry = {
  title: string;
  description: string;
  hero: {
    heading: string;
    subheading: string;
  };
  bullets?: string[];
};

export const seoContent: Record<string, SeoEntry> = {
  '/': {
    title: 'SimpleAutomate · Lightweight CRM & automation for small teams',
    description:
      'SimpleAutomate combines pipeline tracking, marketing automation, and Stripe-powered billing in a single lightweight SaaS built for lean teams.',
    hero: {
      heading: 'Automate follow-ups and close deals faster.',
      subheading:
        'SimpleAutomate unites CRM pipelines, email automations, and campaigns into one focused workspace with a 7-day free trial.',
    },
    bullets: ['Multi-tenant CRM dashboards', 'Visual automation builder', 'Stripe billing ready'],
  },
  '/pricing': {
    title: 'Affordable CRM Automation · £5/mo with 7-day free trial',
    description:
      'All CRM, automation, and campaign tools for just £5 per month. Includes pipeline drag-and-drop, automation builder, bulk email scheduling, and Stripe-managed billing.',
    hero: {
      heading: 'One transparent price. Every feature included.',
      subheading: 'Unlimited automations, contacts, and campaigns for just £5 per month after your trial.',
    },
  },
  '/about': {
    title: 'About SimpleAutomate · Built for 200 active users',
    description:
      'SimpleAutomate is handcrafted for boutique agencies needing CRM clarity, email automation, and marketing campaigns without HubSpot complexity.',
    hero: {
      heading: 'Our mission is clarity over chaos.',
      subheading:
        'We designed SimpleAutomate for teams who want dependable automation without enterprise overhead.',
    },
  },
  '/features/crm': {
    title: 'CRM Features · Contacts, notes, tasks, and timelines',
    description:
      'Organise people, notes, and tasks inside a Kanban pipeline with markdown note-taking, revision history, and contact tagging.',
    hero: {
      heading: 'A precise CRM built for relationships.',
      subheading: 'Track every interaction, stage, and task with drag-and-drop simplicity.',
    },
  },
  '/features/automation': {
    title: 'Automation Builder · Trigger-based workflows',
    description:
      'Create automation sequences that react to contact creation, pipeline stage changes, or calendar dates.',
    hero: {
      heading: 'Automations that launch themselves.',
      subheading: 'Trigger actions from pipeline movement, new contacts, or specific calendar events.',
    },
  },
  '/features/email-marketing': {
    title: 'Email Marketing · Campaigns, newsletters, and analytics',
    description:
      'Design broadcasts, save templates, and capture sent, opened, and clicked events directly in your database.',
    hero: {
      heading: 'Send newsletters without leaving your CRM.',
      subheading: 'Segment contacts, schedule broadcasts, and review engagement at a glance.',
    },
  },
  '/features/pipelines': {
    title: 'Pipeline Management · Drag-and-drop Kanban board',
    description:
      'Build per-user pipelines with reorderable stages, visual metrics, and automation triggers tied to movement.',
    hero: {
      heading: 'Move deals through stages with confidence.',
      subheading: 'Drag and drop contacts, auto-trigger emails, and measure wins per stage.',
    },
  },
  '/contact': {
    title: 'Contact SimpleAutomate · Request a guided setup',
    description:
      'Need onboarding support or billing help? Schedule time with the SimpleAutomate team for personalised guidance.',
    hero: {
      heading: 'We’re here to help you automate faster.',
      subheading: 'Send us a message for onboarding, billing, or partnership questions.',
    },
  },
  '/terms': {
    title: 'Terms of Service · SimpleAutomate',
    description:
      'The official terms of service governing your SimpleAutomate subscription, billing, and acceptable use.',
    hero: {
      heading: 'SimpleAutomate Terms of Service',
      subheading: 'Clear policies to keep your automation workspace safe and secure.',
    },
  },
  '/privacy': {
    title: 'Privacy Policy · SimpleAutomate',
    description:
      'How SimpleAutomate collects, stores, and processes your CRM, automation, and billing data.',
    hero: {
      heading: 'Your data stays encrypted and portable.',
      subheading: 'Learn how we protect contact records, automation events, and billing details.',
    },
  },
};

