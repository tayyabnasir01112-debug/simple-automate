import { sign, verify, type Secret, type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

type AccessTokenPayload = {
  sub: string;
  email: string;
  subscriptionStatus: string;
};

export const createAccessToken = (payload: AccessTokenPayload) => {
  const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn'];
  return sign(payload, env.JWT_ACCESS_SECRET as Secret, { expiresIn });
};

export const verifyAccessToken = (token: string) =>
  verify(token, env.JWT_ACCESS_SECRET as Secret) as AccessTokenPayload & JwtPayload;

