import { prisma } from '../lib/prisma';

const defaultTemplates = [
  {
    name: 'Welcome sequence – day 1',
    subject: 'Welcome to our workspace {{contact.firstName}}',
    body: `<p>Hi {{contact.firstName}},</p>
<p>Great to meet you! This note is sent via SimpleAutomate so every reply lands in your CRM history.</p>
<p>Hit reply if you have any questions or book time directly with me.</p>
<p>— The SimpleAutomate team</p>`,
  },
  {
    name: 'Event / webinar invite',
    subject: 'You\'re invited: upcoming workshop',
    body: `<p>Hi {{contact.firstName}},</p>
<p>We’re hosting a short live session that walks through the exact automation stack our clients use.</p>
<ul>
  <li>15 minute playbook</li>
  <li>Live Q&A</li>
  <li>Replay delivered if you can’t attend</li>
</ul>
<p>Reserve a seat with one click below.</p>`,
  },
  {
    name: 'Customer success check-in',
    subject: 'Quick check-in',
    body: `<p>Hi {{contact.firstName}},</p>
<p>Just checking in to see how things are progressing. Reply with any blockers and we’ll slot a quick call.</p>
<p>Talk soon!</p>`,
  },
];

export const ensureDefaultTemplates = async (userId: string) => {
  const existing = await prisma.emailTemplate.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.emailTemplate.createMany({
    data: defaultTemplates.map((template) => ({
      userId,
      name: template.name,
      subject: template.subject,
      body: template.body,
    })),
  });
};

