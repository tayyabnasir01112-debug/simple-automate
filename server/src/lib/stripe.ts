import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const ensureStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  return stripe;
};

