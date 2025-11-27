import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { ensureDefaultTemplates } from '../services/template-service';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await ensureDefaultTemplates(req.user!.id);
    const templates = await prisma.emailTemplate.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json({ templates });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().min(2),
      subject: z.string().min(1),
      body: z.string().min(1),
    });
    const body = schema.parse(req.body);

    const template = await prisma.emailTemplate.create({
      data: {
        userId: req.user!.id,
        ...body,
      },
    });

    return res.status(201).json({ template });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const template = await prisma.emailTemplate.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: template.id },
      data: body,
    });

    return res.json({ template: updated });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const template = await prisma.emailTemplate.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    await prisma.emailTemplate.delete({ where: { id: template.id } });
    return res.status(204).send();
  }),
);

export default router;

