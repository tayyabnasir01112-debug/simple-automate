import {
  AutomationLogStatus,
  AutomationStepType,
  AutomationTriggerType,
  type Automation,
  type AutomationLog,
  type AutomationStep,
} from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { sendSystemEmail, renderEmailLayout } from '../lib/email';

const loadAutomationSteps = async (automationId: string) =>
  prisma.automationStep.findMany({
    where: { automationId },
    orderBy: { position: 'asc' },
  });

const enqueueStep = async (
  automation: Automation,
  step: AutomationStep,
  contactId: string,
  scheduledFor: Date,
) => {
  await prisma.automationLog.create({
    data: {
      automationId: automation.id,
      userId: automation.userId,
      contactId,
      stepId: step.id,
      status: AutomationLogStatus.QUEUED,
      scheduledFor,
    },
  });
};

export const triggerAutomationsForEvent = async ({
  userId,
  triggerType,
  contactId,
}: {
  userId: string;
  triggerType: AutomationTriggerType;
  contactId: string;
}) => {
  const automations = await prisma.automation.findMany({
    where: { userId, active: true, triggerType },
    include: { steps: { orderBy: { position: 'asc' } } },
  });

  await Promise.all(
    automations.map(async (automation) => {
      if (!automation.steps.length) return;
      await enqueueStep(automation, automation.steps[0], contactId, new Date());
    }),
  );
};

const enqueueNextStep = async (
  log: AutomationLog,
  steps: AutomationStep[],
  scheduledFor: Date,
) => {
  const currentIndex = steps.findIndex((step) => step.id === log.stepId);
  if (currentIndex === -1) return;
  const nextStep = steps[currentIndex + 1];
  if (!nextStep || !log.contactId) return;

  await prisma.automationLog.create({
    data: {
      automationId: log.automationId,
      userId: log.userId,
      contactId: log.contactId,
      stepId: nextStep.id,
      status: AutomationLogStatus.QUEUED,
      scheduledFor,
    },
  });
};

const handleEmailStep = async (log: AutomationLog, step: AutomationStep) => {
  if (!log.contactId) {
    throw new Error('Missing contact for email step');
  }
  const contact = await prisma.contact.findUnique({ where: { id: log.contactId } });
  if (!contact?.email) {
    throw new Error('Contact has no email address');
  }

  const config = step.config as {
    subject?: string;
    body?: string;
    templateId?: string;
  };

  let subject = config.subject ?? 'SimpleAutomate Automation';
  let body = config.body ?? '';

  if (config.templateId) {
    const template = await prisma.emailTemplate.findUnique({ where: { id: config.templateId } });
    if (template) {
      subject = template.subject;
      body = template.body;
    }
  }

  const owner = await prisma.user.findUnique({ where: { id: log.userId }, select: { email: true } });

  await sendSystemEmail({
    to: contact.email,
    subject,
    html: renderEmailLayout(subject, body),
    replyTo: owner?.email,
  });
};

const handleDelayStep = async (step: AutomationStep) => {
  const config = step.config as { amount?: number; unit?: 'minute' | 'hour' | 'day' };
  const amount = config.amount ?? 1;
  const unit = config.unit ?? 'day';
  return dayjs().add(amount, unit).toDate();
};

const handleTagStep = async (log: AutomationLog, step: AutomationStep) => {
  if (!log.contactId) throw new Error('Missing contact for tag step');
  const config = step.config as { tags?: string[]; action?: 'add' | 'remove' };
  const tags = config.tags ?? [];
  const action = config.action ?? 'add';

  const contact = await prisma.contact.findUnique({ where: { id: log.contactId } });
  if (!contact) throw new Error('Contact not found');

  let nextTags = contact.tags ?? [];
  if (action === 'add') {
    const tagSet = new Set(nextTags);
    tags.forEach((tag) => tagSet.add(tag));
    nextTags = Array.from(tagSet);
  } else {
    nextTags = nextTags.filter((tag) => !tags.includes(tag));
  }

  await prisma.contact.update({
    where: { id: contact.id },
    data: { tags: nextTags },
  });
};

const handleMoveStageStep = async (log: AutomationLog, step: AutomationStep) => {
  if (!log.contactId) throw new Error('Missing contact for stage move step');

  const config = step.config as { stageId?: string };
  if (!config.stageId) throw new Error('stageId missing');

  await prisma.contactStage.create({
    data: {
      contactId: log.contactId,
      stageId: config.stageId,
    },
  });
};

const processStep = async (log: AutomationLog, step: AutomationStep) => {
  switch (step.type) {
    case AutomationStepType.SEND_EMAIL:
      await handleEmailStep(log, step);
      return { nextRun: new Date() };
    case AutomationStepType.DELAY:
      return { nextRun: await handleDelayStep(step) };
    case AutomationStepType.UPDATE_TAGS:
      await handleTagStep(log, step);
      return { nextRun: new Date() };
    case AutomationStepType.MOVE_STAGE:
      await handleMoveStageStep(log, step);
      return { nextRun: new Date() };
    default:
      throw new Error(`Unsupported automation step ${step.type}`);
  }
};

export const processAutomationQueue = async () => {
  const pendingLogs = await prisma.automationLog.findMany({
    where: {
      status: AutomationLogStatus.QUEUED,
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
    },
    orderBy: { timestamp: 'asc' },
    take: 20,
  });

  for (const log of pendingLogs) {
    if (!log.stepId) continue;
    const [step, automationSteps] = await Promise.all([
      prisma.automationStep.findUnique({ where: { id: log.stepId } }),
      loadAutomationSteps(log.automationId),
    ]);

    if (!step) {
      await prisma.automationLog.update({
        where: { id: log.id },
        data: { status: AutomationLogStatus.FAILED, message: 'Missing step reference' },
      });
      continue;
    }

    try {
      const { nextRun } = await processStep(log, step);
      await prisma.automationLog.update({
        where: { id: log.id },
        data: {
          status: AutomationLogStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      await enqueueNextStep(log, automationSteps, nextRun);
    } catch (error) {
      await prisma.automationLog.update({
        where: { id: log.id },
        data: {
          status: AutomationLogStatus.FAILED,
          message: (error as Error).message,
        },
      });
    }
  }
};

export const scheduleDateAutomations = async () => {
  const automations = await prisma.automation.findMany({
    where: { triggerType: AutomationTriggerType.DATE, active: true },
  });

  for (const automation of automations) {
    const config = automation.triggerConfig as { offsetDays?: number };
    const offset = config.offsetDays ?? 0;
    const targetDate = dayjs().add(offset, 'day').startOf('day');
    const nextDate = targetDate.add(1, 'day');

    const contacts = await prisma.contact.findMany({
      where: {
        userId: automation.userId,
        createdAt: {
          gte: targetDate.toDate(),
          lt: nextDate.toDate(),
        },
      },
      select: { id: true },
    });

    const firstStep = await prisma.automationStep.findFirst({
      where: { automationId: automation.id },
      orderBy: { position: 'asc' },
    });

    if (!firstStep) continue;

    await Promise.all(
      contacts.map((contact) => enqueueStep(automation, firstStep, contact.id, new Date())),
    );
  }
};

