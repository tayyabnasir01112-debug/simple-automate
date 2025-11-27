import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
  };
};

const extractToken = (req: Request) => {
  const headerToken = req.headers.authorization?.replace('Bearer ', '');
  if (headerToken) return headerToken;

  const cookieToken = (req.cookies?.accessToken as string | undefined)?.trim();
  return cookieToken;
};

export const attachUser = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      subscriptionStatus: payload.subscriptionStatus,
    };
  } catch (error) {
    console.warn('Failed to attach auth user', (error as Error).message);
  }

  return next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  return next();
};

