import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const [contactCount, activeTasks, wonStages] = await Promise.all([
      prisma.contact.count({ where: { userId: req.user!.id } }),
      prisma.task.count({ where: { userId: req.user!.id, completed: false } }),
      prisma.contactStage.count({
        where: {
          contact: { userId: req.user!.id },
          stage: { name: 'Won' },
        },
      }),
    ]);

    return res.json({
      stats: {
        contactCount,
        openTasks: activeTasks,
        wins: wonStages,
      },
    });
  }),
);

export default router;

