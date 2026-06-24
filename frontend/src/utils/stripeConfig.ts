const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ?? '';

export function isStripeConfigured(): boolean {
  return publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_');
}

export const stripePublishableKey = publishableKey;

export const STRIPE_SETUP_HINT =
  'Add Stripe test keys: run scripts/setup-stripe.ps1 or set STRIPE_SECRET_KEY in backend/.env and VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env, then restart both servers. Keys: https://dashboard.stripe.com/test/apikeys';
