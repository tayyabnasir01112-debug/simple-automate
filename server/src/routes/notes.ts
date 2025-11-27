import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

const router = Router();
router.use(requireAuth);

router.get(
  '/contacts/:contactId',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const notes = await prisma.note.findMany({
      where: { contactId: req.params.contactId, userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ notes });
  }),
);

router.post(
  '/contacts/:contactId',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const body = schema.parse(req.body);

    const contact = await prisma.contact.findFirst({
      where: { id: req.params.contactId, userId: req.user!.id },
    });
    if (!contact) throw new AppError('Contact not found', 404);

    const note = await prisma.note.create({
      data: {
        userId: req.user!.id,
        contactId: contact.id,
        content: body.content,
      },
    });

    await prisma.noteRevision.create({
      data: {
        noteId: note.id,
        userId: req.user!.id,
        content: body.content,
      },
    });

    return res.status(201).json({ note });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({ content: z.string().min(1) });
    const body = schema.parse(req.body);

    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new AppError('Note not found', 404);

    const updated = await prisma.note.update({
      where: { id: existing.id },
      data: { content: body.content },
    });

    await prisma.noteRevision.create({
      data: {
        noteId: existing.id,
        userId: req.user!.id,
        content: body.content,
      },
    });

    return res.json({ note: updated });
  }),
);

router.get(
  '/:id/revisions',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!note) throw new AppError('Note not found', 404);

    const revisions = await prisma.noteRevision.findMany({
      where: { noteId: note.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ revisions });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new AppError('Note not found', 404);

    await prisma.note.delete({ where: { id: existing.id } });
    return res.status(204).send();
  }),
);

export default router;

