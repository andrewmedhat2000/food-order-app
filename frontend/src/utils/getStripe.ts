import { loadStripe, Stripe } from '@stripe/stripe-js';
import { isStripeConfigured, stripePublishableKey } from '../utils/stripeConfig';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!isStripeConfigured()) {
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }

  return stripePromise;
}
