import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const status = (req.query.status as string | undefined)?.toLowerCase();
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user!.id,
        ...(status === 'completed'
          ? { completed: true }
          : status === 'pending'
          ? { completed: false }
          : {}),
      },
      include: { contact: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
    });

    return res.json({ tasks });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      title: z.string().min(2),
      contactId: z.string().optional(),
      dueDate: z.string().optional(),
    });
    const body = schema.parse(req.body);

    if (body.contactId) {
      const contactExists = await prisma.contact.findFirst({
        where: { id: body.contactId, userId: req.user!.id },
      });
      if (!contactExists) throw new AppError('Contact not found', 404);
    }

    const task = await prisma.task.create({
      data: {
        userId: req.user!.id,
        contactId: body.contactId,
        title: body.title,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    return res.status(201).json({ task });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      title: z.string().optional(),
      dueDate: z.string().optional(),
      completed: z.boolean().optional(),
    });
    const body = schema.parse(req.body);

    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new AppError('Task not found', 404);

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });

    return res.json({ task: updated });
  }),
);

router.post(
  '/:id/complete',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new AppError('Task not found', 404);

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: { completed: true },
    });
    return res.json({ task: updated });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new AppError('Task not found', 404);

    await prisma.task.delete({ where: { id: existing.id } });
    return res.status(204).send();
  }),
);

export default router;

