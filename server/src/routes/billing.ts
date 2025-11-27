import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { ensureStripe } from '../lib/stripe';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const router = Router();
router.use(requireAuth);

router.post(
  '/checkout',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!env.STRIPE_PRICE_ID) {
      return res.status(400).json({ message: 'Stripe price is not configured' });
    }

    const schema = z.object({
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    });
    const body = schema.parse(req.body);

    const stripe = ensureStripe();
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      subscription_data: {
        trial_period_days: user.subscriptionStatus === 'trialing' ? undefined : 0,
      },
    });

    return res.json({ url: session.url });
  }),
);

export const billingRouter = router;

const handleSubscriptionUpdate = async (subscription: Stripe.Subscription) => {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    },
  });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'Webhook secret missing' });
  }

  const stripe = ensureStripe();
  const signature = req.headers['stripe-signature'];
  if (!signature) return res.status(400).send('Missing signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
        await handleSubscriptionUpdate(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceWithSub = invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription;
        subscription_details?: { subscription?: string };
      };
      const subscriptionId =
        (invoiceWithSub.subscription &&
          (typeof invoiceWithSub.subscription === 'string'
            ? invoiceWithSub.subscription
            : invoiceWithSub.subscription.id)) ??
        invoiceWithSub.subscription_details?.subscription;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId.toString());
        await handleSubscriptionUpdate(subscription);
      }
      break;
    }
    default:
      break;
  }

  return res.json({ received: true });
};

