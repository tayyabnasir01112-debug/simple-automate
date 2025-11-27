import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { ensureDefaultPipeline } from '../services/pipeline-service';
import { triggerAutomationsForEvent } from '../services/automation-runner';
import { AutomationTriggerType } from '@prisma/client';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const search = (req.query.search as string | undefined)?.trim();
    const tag = (req.query.tag as string | undefined)?.trim();

    const contacts = await prisma.contact.findMany({
      where: {
        userId: req.user!.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        stages: {
          include: { stage: true },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
        tasks: {
          where: { completed: false },
          orderBy: { dueDate: 'asc' },
          take: 3,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 2,
        },
      },
    });

    return res.json({ contacts });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      tags: z.array(z.string()).optional(),
      stageId: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const contact = await prisma.contact.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        tags: body.tags ?? [],
      },
    });

    let stageId = body.stageId;
    if (!stageId) {
      const pipeline = await ensureDefaultPipeline(req.user!.id);
      const stage = await prisma.stage.findFirst({
        where: { pipelineId: pipeline.id },
        orderBy: { position: 'asc' },
      });
      stageId = stage?.id;
    }

    if (stageId) {
      await prisma.contactStage.create({
        data: { contactId: contact.id, stageId },
      });
    }

    await triggerAutomationsForEvent({
      userId: req.user!.id,
      triggerType: AutomationTriggerType.NEW_CONTACT,
      contactId: contact.id,
    });

    return res.status(201).json({ contact });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    const body = schema.parse(req.body);
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!contact) throw new AppError('Contact not found', 404);

    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: body,
    });

    return res.json({ contact: updated });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!contact) throw new AppError('Contact not found', 404);
    await prisma.contact.delete({ where: { id: contact.id } });
    return res.status(204).send();
  }),
);

router.post(
  '/:id/stage',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ stageId: z.string() });
    const { stageId } = schema.parse(req.body);

    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!contact) throw new AppError('Contact not found', 404);

    const stage = await prisma.stage.findUnique({ where: { id: stageId } });
    if (!stage) throw new AppError('Stage not found', 404);

    await prisma.contactStage.create({
      data: {
        contactId: contact.id,
        stageId,
      },
    });

    await triggerAutomationsForEvent({
      userId: req.user!.id,
      triggerType: AutomationTriggerType.STAGE_CHANGE,
      contactId: contact.id,
    });

    return res.json({ message: 'Stage updated' });
  }),
);

export default router;

