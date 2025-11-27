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

