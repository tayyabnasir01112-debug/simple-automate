import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { registerRoutes } from './routes';
import { attachUser } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { handleStripeWebhook } from './routes/billing';

const app = express();

const marketingPaths = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/features/crm',
  '/features/automation',
  '/features/email-marketing',
  '/features/pipelines',
];

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Sitemap: ${env.publicAppUrl}/sitemap.xml`);
});

app.get('/sitemap.xml', (_req, res) => {
  const urls = marketingPaths
    .map(
      (path) => `
    <url>
      <loc>${env.publicAppUrl}${path}</loc>
      <changefreq>weekly</changefreq>
    </url>`,
    )
    .join('');

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`);
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

registerRoutes(app);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`SimpleAutomate API running on port ${env.PORT}`);
});

