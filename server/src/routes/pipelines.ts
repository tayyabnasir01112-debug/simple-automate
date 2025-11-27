import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { ensureDefaultPipeline } from '../services/pipeline-service';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await ensureDefaultPipeline(req.user!.id);
    const pipelines = await prisma.pipeline.findMany({
      where: { userId: req.user!.id },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    return res.json({ pipelines });
  }),
);

router.get(
  '/board',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const pipelines = await prisma.pipeline.findMany({
      where: { userId: req.user!.id },
      include: { stages: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    if (!pipelines.length) {
      await ensureDefaultPipeline(req.user!.id);
    }

    const contacts = await prisma.contact.findMany({
      where: { userId: req.user!.id },
      include: {
        stages: {
          include: { stage: true },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
        tasks: {
          where: { completed: false },
          orderBy: { dueDate: 'asc' },
          take: 1,
        },
      },
    });

    const stageMap = new Map<string, Array<Record<string, unknown>>>();
    pipelines.forEach((pipeline) => {
      pipeline.stages.forEach((stage) => {
        stageMap.set(stage.id, []);
      });
    });

    const fallbackStageId = pipelines[0]?.stages[0]?.id;

    contacts.forEach((contact) => {
      const currentStageId = contact.stages[0]?.stageId ?? fallbackStageId;
      if (!currentStageId) return;
      if (!stageMap.has(currentStageId)) {
        stageMap.set(currentStageId, []);
      }
      stageMap.get(currentStageId)!.push({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        tags: contact.tags,
        createdAt: contact.createdAt,
        nextTask: contact.tasks[0]
          ? {
              id: contact.tasks[0].id,
              title: contact.tasks[0].title,
              dueDate: contact.tasks[0].dueDate,
            }
          : null,
      });
    });

    const board = pipelines.map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      stages: pipeline.stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        position: stage.position,
        contacts: stageMap.get(stage.id) ?? [],
      })),
    }));

    return res.json({ board });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().min(2),
      stages: z.array(z.string()).min(1).default(['New', 'Contacted', 'Qualified', 'Won']),
    });
    const body = schema.parse(req.body);

    const pipeline = await prisma.pipeline.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        stages: {
          create: body.stages.map((stage, index) => ({ name: stage, position: index })),
        },
      },
      include: { stages: true },
    });

    return res.status(201).json({ pipeline });
  }),
);

router.post(
  '/:id/stages',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ name: z.string().min(1) });
    const body = schema.parse(req.body);

    const pipeline = await prisma.pipeline.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { stages: true },
    });
    if (!pipeline) {
      return res.status(404).json({ message: 'Pipeline not found' });
    }

    const stage = await prisma.stage.create({
      data: {
        pipelineId: pipeline.id,
        name: body.name,
        position: pipeline.stages.length,
      },
    });

    return res.status(201).json({ stage });
  }),
);

router.put(
  '/:id/stages/reorder',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ stageOrder: z.array(z.string()) });
    const body = schema.parse(req.body);

    await Promise.all(
      body.stageOrder.map((stageId, index) =>
        prisma.stage.updateMany({
          where: { id: stageId, pipeline: { userId: req.user!.id, id: req.params.id } },
          data: { position: index },
        }),
      ),
    );

    return res.json({ message: 'Reordered' });
  }),
);

export default router;

