import { config } from 'dotenv';
import { z } from 'zod';

config({ path: process.env.ENV_PATH || undefined });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 4000)),
  DATABASE_URL: z.string().url(),
  FRONTEND_URLS: z.string().default('http://localhost:5173'),
  APP_BASE_URL: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CRON_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('SimpleAutomate <hello@simpleautomate.co.uk>'),
  TRIAL_DAYS: z
    .string()
    .optional()
    .transform((v) => Number(v ?? 7)),
});

const parseOrigins = (value?: string) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'https://simpleautomate.co.uk',
  'https://www.simpleautomate.co.uk',
  'https://simpleautomate-co-uk.netlify.app',
];

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const declaredOrigins = [...parseOrigins(parsed.data.FRONTEND_URLS), ...parseOrigins(parsed.data.APP_BASE_URL)];
const clientOrigins = Array.from(new Set([...declaredOrigins, ...DEFAULT_ORIGINS]));
const preferredOrigin =
  clientOrigins.find((origin) => origin.includes('simpleautomate.co.uk')) ?? clientOrigins[0] ?? DEFAULT_ORIGINS[0];

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  clientOrigins,
  publicAppUrl: preferredOrigin,
};

