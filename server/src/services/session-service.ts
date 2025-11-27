import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { addDuration } from '../utils/duration';

const parseRefreshExpiry = () => addDuration(env.REFRESH_TOKEN_EXPIRES_IN, dayjs()).toDate();

const splitToken = (token: string) => {
  const [sessionId, secret] = token.split('.');
  if (!sessionId || !secret) throw new Error('Invalid refresh token');
  return { sessionId, secret };
};

export const createSession = async (userId: string) => {
  const sessionId = randomUUID();
  const secret = randomUUID();
  const hash = await bcrypt.hash(secret, 12);
  const expiresAt = parseRefreshExpiry();

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshTokenHash: hash,
      expiresAt,
    },
  });

  return {
    refreshToken: `${sessionId}.${secret}`,
    expiresAt,
    sessionId,
  };
};

export const validateRefreshToken = async (token: string) => {
  const { sessionId, secret } = splitToken(token);
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return null;
  if (dayjs(session.expiresAt).isBefore(dayjs())) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  const isMatch = await bcrypt.compare(secret, session.refreshTokenHash);
  if (!isMatch) return null;

  return session;
};

export const revokeSession = (sessionId: string) => prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined);

