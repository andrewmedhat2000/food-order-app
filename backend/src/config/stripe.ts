import Stripe from 'stripe';
import { env } from './env';

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey)
  : null;

export function isStripeConfigured(): boolean {
  return Boolean(stripe);
}
