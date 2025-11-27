import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { env } from '../config/env';
import { processAutomationQueue, scheduleDateAutomations } from '../services/automation-runner';
import { processScheduledCampaigns } from '../services/campaign-service';
import { prisma } from '../lib/prisma';
import { sendSystemEmail, renderEmailLayout } from '../lib/email';
import type { Prisma } from '@prisma/client';

const router = Router();

type TaskWithRelations = Prisma.TaskGetPayload<{ include: { user: true; contact: true } }>;

const sendTaskNotifications = async () => {
  const tasks = await prisma.task.findMany({
    where: {
      completed: false,
      notificationSent: false,
      dueDate: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    },
    include: { user: true, contact: true },
  });

  await Promise.all(
    tasks.map(async (task: TaskWithRelations) => {
      await sendSystemEmail({
        to: task.user.email,
        subject: `Task due soon: ${task.title}`,
        html: renderEmailLayout(
          'Task Reminder',
          `Task <strong>${task.title}</strong>${
            task.contact ? ` for ${task.contact.name}` : ''
          } is due ${task.dueDate?.toLocaleString() ?? 'soon'}.`,
        ),
      });

      await prisma.task.update({
        where: { id: task.id },
        data: { notificationSent: true },
      });
    }),
  );
};

router.post(
  '/run',
  asyncHandler(async (req, res) => {
    const schema = z.object({ secret: z.string() });
    const { secret } = schema.parse(req.body);
    if (secret !== env.CRON_SECRET) {
      return res.status(401).json({ message: 'Unauthorized cron' });
    }

    await Promise.all([processAutomationQueue(), processScheduledCampaigns(), sendTaskNotifications()]);
    await scheduleDateAutomations();

    return res.json({ ok: true });
  }),
);

export default router;

