import dayjs from 'dayjs';
import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ensureStripe } from '../lib/stripe';

export const refreshSubscriptionForUser = async (user: User) => {
  let updatedStatus = user.subscriptionStatus;

  if (user.trialEndsAt && dayjs().isAfter(user.trialEndsAt) && user.subscriptionStatus === 'trialing') {
    updatedStatus = 'expired';
  }

  if (user.stripeSubscriptionId) {
    try {
      const stripe = ensureStripe();
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      updatedStatus = subscription.status;
    } catch (error) {
      console.error('Failed to sync Stripe subscription', error);
    }
  }

  if (updatedStatus !== user.subscriptionStatus) {
    return prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: updatedStatus },
    });
  }

  return user;
};

