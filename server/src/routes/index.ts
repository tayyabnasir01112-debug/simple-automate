import type { Express } from 'express';
import authRouter from './auth';
import contactsRouter from './contacts';
import pipelinesRouter from './pipelines';
import notesRouter from './notes';
import tasksRouter from './tasks';
import automationsRouter from './automations';
import templatesRouter from './templates';
import campaignsRouter from './campaigns';
import cronRouter from './cron';
import { billingRouter } from './billing';
import { requireSubscription } from '../middleware/subscription';
import dashboardRouter from './dashboard';
import supportRouter from './support';

export const registerRoutes = (app: Express) => {
  app.use('/api/auth', authRouter);
  app.use('/api/contacts', contactsRouter);
  app.use('/api/pipelines', pipelinesRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/templates', templatesRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/support', supportRouter);

  // Subscription protected routes
  app.use('/api/automations', requireSubscription, automationsRouter);
  app.use('/api/campaigns', requireSubscription, campaignsRouter);
  app.use('/api/cron', cronRouter);
};

