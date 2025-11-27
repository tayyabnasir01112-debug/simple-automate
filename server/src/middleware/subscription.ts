import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './auth';

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export const requireSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const status = req.user?.subscriptionStatus;

  if (!status || !ACTIVE_STATUSES.has(status)) {
    return res.status(402).json({
      message: 'Your subscription is inactive. Please update billing information.',
    });
  }

  return next();
};

