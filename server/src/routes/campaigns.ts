import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { dispatchCampaignNow } from '../services/campaign-service';
import { EmailCampaignStatus } from '@prisma/client';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const campaigns = await prisma.emailCampaign.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        recipients: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true,
          },
        },
      },
    });

    return res.json({ campaigns });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const schema = z.object({
      name: z.string().min(2),
      subject: z.string().min(1),
      body: z.string().min(1),
      contactIds: z.array(z.string()).min(1),
      scheduledFor: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const contacts = await prisma.contact.findMany({
      where: { id: { in: body.contactIds }, userId: req.user!.id },
      select: { id: true },
    });

    const campaign = await prisma.emailCampaign.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        subject: body.subject,
        body: body.body,
        status: body.scheduledFor ? EmailCampaignStatus.SCHEDULED : EmailCampaignStatus.SENDING,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        recipients: {
          create: contacts.map((contact) => ({
            contactId: contact.id,
          })),
        },
      },
      include: { recipients: true },
    });

    if (!body.scheduledFor) {
      await dispatchCampaignNow(campaign.id);
    }

    return res.status(201).json({ campaign });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    await prisma.emailCampaign.delete({ where: { id: campaign.id } });
    return res.status(204).send();
  }),
);

export default router;

