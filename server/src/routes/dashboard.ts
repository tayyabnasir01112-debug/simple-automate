import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userFilter = { userId: req.user!.id };

    const [contactCount, activeTasks, wonStages, automationCount, campaignCount, templateCount] = await Promise.all([
      prisma.contact.count({ where: userFilter }),
      prisma.task.count({ where: { ...userFilter, completed: false } }),
      prisma.contactStage.count({
        where: {
          contact: userFilter,
          stage: { name: 'Won' },
        },
      }),
      prisma.automation.count({ where: userFilter }),
      prisma.emailCampaign.count({ where: userFilter }),
      prisma.emailTemplate.count({ where: userFilter }),
    ]);

    return res.json({
      stats: {
        contactCount,
        openTasks: activeTasks,
        wins: wonStages,
        automationCount,
        campaignCount,
        templateCount,
      },
    });
  }),
);

export default router;

