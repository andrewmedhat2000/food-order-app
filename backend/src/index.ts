import { connectDatabase } from './config/database';
import { env } from './config/env';
import { isStripeConfigured } from './config/stripe';
import { createApp } from './app';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on port ${env.port}`);
    if (isStripeConfigured()) {
      console.log('Stripe: enabled (test/live secret key loaded)');
    } else {
      console.log('Stripe: disabled — set STRIPE_SECRET_KEY in backend/.env for online payments');
    }
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
