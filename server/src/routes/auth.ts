import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/password';
import { createAccessToken } from '../lib/jwt';
import { createSession, revokeSession, validateRefreshToken } from '../services/session-service';
import { env } from '../config/env';
import { AppError } from '../middleware/error-handler';
import { sendSystemEmail, renderEmailLayout } from '../lib/email';
import { ensureDefaultPipeline } from '../services/pipeline-service';
import { ensureDefaultTemplates } from '../services/template-service';
import { refreshSubscriptionForUser } from '../services/subscription-service';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import type { User } from '@prisma/client';

const authRouter = Router();

const cookieSettings = {
  httpOnly: true,
  sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
  secure: env.isProduction,
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 30,
};

type PublicUser = Omit<User, 'passwordHash' | 'resetToken' | 'verificationToken'>;

const sanitizeUser = (user: User): PublicUser => {
  const { passwordHash, resetToken, verificationToken, ...safe } = user;
  return safe as PublicUser;
};

const issueTokens = async (userId: string, email: string, subscriptionStatus: string) => {
  const accessToken = createAccessToken({ sub: userId, email, subscriptionStatus });
  const { refreshToken, sessionId } = await createSession(userId);
  return { accessToken, refreshToken, sessionId };
};

const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${env.publicAppUrl}/verify-email?token=${token}`;
  await sendSystemEmail({
    to: email,
    subject: 'Verify your SimpleAutomate email',
    html: renderEmailLayout(
      'Verify your email',
      `Finish setting up SimpleAutomate by clicking <a href="${verifyUrl}">verify email</a>.`,
    ),
  });
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.publicAppUrl}/reset-password?token=${token}`;
  await sendSystemEmail({
    to: email,
    subject: 'Reset your SimpleAutomate password',
    html: renderEmailLayout('Reset password', `Use the code below to reset your password: <strong>${token}</strong><br/>or open ${resetUrl}`),
  });
};

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const body = schema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new AppError('Account already exists', 409);
    }

    const verificationToken = crypto.randomUUID();
    const trialEndsAt = new Date(Date.now() + env.TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: await hashPassword(body.password),
        verificationToken,
        trialEndsAt,
        subscriptionStatus: 'trialing',
      },
    });

    await ensureDefaultPipeline(user.id);
    await ensureDefaultTemplates(user.id);
    await sendVerificationEmail(user.email, verificationToken);

    const { accessToken, refreshToken } = await issueTokens(user.id, user.email, user.subscriptionStatus);
    res.cookie('refreshToken', refreshToken, cookieSettings);

    return res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
    });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const body = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const isValid = await comparePassword(body.password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const syncedUser = await refreshSubscriptionForUser(user);

    const { accessToken, refreshToken } = await issueTokens(
      syncedUser.id,
      syncedUser.email,
      syncedUser.subscriptionStatus,
    );

    res.cookie('refreshToken', refreshToken, cookieSettings);
    return res.json({ user: sanitizeUser(syncedUser), accessToken });
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.cookies?.refreshToken as string | undefined) ?? req.body?.refreshToken;
    if (!token) throw new AppError('Missing refresh token', 401);

    const session = await validateRefreshToken(token);
    if (!session) throw new AppError('Invalid refresh token', 401);

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new AppError('Account no longer exists', 401);

    const synced = await refreshSubscriptionForUser(user);
    const { accessToken, refreshToken } = await issueTokens(
      synced.id,
      synced.email,
      synced.subscriptionStatus,
    );

    res.cookie('refreshToken', refreshToken, cookieSettings);
    return res.json({ accessToken });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = (req.cookies?.refreshToken as string | undefined) ?? req.body?.refreshToken;
    if (token) {
      const [sessionId] = token.split('.');
      if (sessionId) {
        await revokeSession(sessionId);
      }
    }
    res.clearCookie('refreshToken', { ...cookieSettings, maxAge: 0 });
    return res.json({ message: 'Logged out' });
  }),
);

authRouter.post(
  '/verify-request',
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().email() });
    const body = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      const token = crypto.randomUUID();
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: token },
      });
      await sendVerificationEmail(user.email, token);
    }
    return res.json({ message: 'If the account exists, an email was sent.' });
  }),
);

authRouter.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string().min(10) });
    const { token } = schema.parse(req.body);
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new AppError('Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return res.json({ message: 'Email verified' });
  }),
);

authRouter.post(
  '/password-reset-request',
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().email() });
    const body = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      const token = crypto.randomUUID();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      await sendPasswordResetEmail(user.email, token);
    }
    return res.json({ message: 'If the account exists, a reset email is on the way.' });
  }),
);

authRouter.post(
  '/password-reset',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      token: z.string(),
      password: z.string().min(8),
    });
    const body = schema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        resetToken: body.token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) throw new AppError('Invalid or expired token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(body.password),
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return res.json({ message: 'Password updated' });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError('User not found', 404);
    return res.json({ user: sanitizeUser(user) });
  }),
);

export default authRouter;

