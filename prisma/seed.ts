import { PrismaClient, AutomationStepType, AutomationTriggerType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'DemoPass123!';

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@simpleautomate.co.uk' },
    update: {},
    create: {
      email: 'demo@simpleautomate.co.uk',
      passwordHash,
      emailVerified: true,
      subscriptionStatus: 'active',
    },
  });

  let pipeline = await prisma.pipeline.findFirst({ where: { userId: user.id } });
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        userId: user.id,
        name: 'Sales',
        stages: {
          create: ['New', 'Contacted', 'Qualified', 'Won'].map((name, index) => ({
            name,
            position: index,
          })),
        },
      },
    });
  }

  const automationExists = await prisma.automation.findFirst({
    where: { userId: user.id, name: 'Welcome new contact' },
  });
  if (!automationExists) {
    await prisma.automation.create({
      data: {
        userId: user.id,
        name: 'Welcome new contact',
        triggerType: AutomationTriggerType.NEW_CONTACT,
        active: true,
        triggerConfig: {},
        steps: {
          create: [
            {
              type: AutomationStepType.SEND_EMAIL,
              position: 0,
              config: {
                subject: 'Welcome to SimpleAutomate',
                body: 'Thanks for joining our CRM!',
              },
            },
          ],
        },
      },
    });
  }

  console.log('Seeded demo user -> demo@simpleautomate.co.uk / DemoPass123!');
  console.log('Pipeline ID', pipeline.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

