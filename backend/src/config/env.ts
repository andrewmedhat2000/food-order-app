import dotenv from 'dotenv';

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5001),
  mongodbUri: required('MONGODB_URI', process.env.MONGODB_URI),
  jwtSecret: required('JWT_SECRET', process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  allowedOrigins: (process.env.CLIENT_URL ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim() ?? '',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY?.trim() ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '',
};

export function isStripeEnvConfigured(): boolean {
  return env.stripeSecretKey.startsWith('sk_test_') || env.stripeSecretKey.startsWith('sk_live_');
}
