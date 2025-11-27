import { Router } from 'express';
import { z } from 'zod';
import { Prisma, AutomationStepType, AutomationTriggerType } from '@prisma/client';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

const router = Router();
router.use(requireAuth);

const stepSchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(AutomationStepType),
  position: z.number().int(),
  config: z.any().default({}),
});

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const automations = await prisma.automation.findMany({
      where: { userId: req.user!.id },
      include: {
        steps: { orderBy: { position: 'asc' } },
        logs: { orderBy: { timestamp: 'desc' }, take: 10 },
      },
    });
    return res.json({ automations });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().min(2),
      active: z.boolean().default(true),
      triggerType: z.nativeEnum(AutomationTriggerType),
      triggerConfig: z.any().default({}),
      steps: z.array(stepSchema).min(1),
    });
    const body = schema.parse(req.body);

    const automation = await prisma.automation.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        active: body.active,
        triggerType: body.triggerType,
        triggerConfig: body.triggerConfig as Prisma.InputJsonValue,
        steps: {
          create: body.steps.map((step) => ({
            type: step.type,
            position: step.position,
            config: step.config as Prisma.InputJsonValue,
          })),
        },
      },
      include: { steps: true },
    });

    return res.status(201).json({ automation });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().optional(),
      active: z.boolean().optional(),
      triggerType: z.nativeEnum(AutomationTriggerType).optional(),
      triggerConfig: z.any().optional(),
    });
    const body = schema.parse(req.body);

    const automation = await prisma.automation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!automation) throw new AppError('Automation not found', 404);

    const updated = await prisma.automation.update({
      where: { id: automation.id },
      data: {
        ...body,
        triggerType: body.triggerType,
        triggerConfig: body.triggerConfig as Prisma.InputJsonValue | undefined,
      },
    });

    return res.json({ automation: updated });
  }),
);

router.put(
  '/:id/steps',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ steps: z.array(stepSchema) });
    const { steps } = schema.parse(req.body);

    const automation = await prisma.automation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!automation) throw new AppError('Automation not found', 404);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.automationStep.deleteMany({ where: { automationId: automation.id } });
      await tx.automationStep.createMany({
        data: steps.map((step) => ({
          automationId: automation.id,
          type: step.type,
          position: step.position,
          config: step.config as Prisma.InputJsonValue,
        })),
      });
    });

    const refreshed = await prisma.automation.findUnique({
      where: { id: automation.id },
      include: { steps: { orderBy: { position: 'asc' } } },
    });

    return res.json({ automation: refreshed });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const automation = await prisma.automation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!automation) throw new AppError('Automation not found', 404);
    await prisma.automation.delete({ where: { id: automation.id } });
    return res.status(204).send();
  }),
);

export default router;

