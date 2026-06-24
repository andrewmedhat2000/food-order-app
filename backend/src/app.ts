import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { isStripeConfigured } from './config/stripe';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && LOCALHOST_ORIGIN.test(origin)) return true;
  return false;
}

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, origin ?? env.allowedOrigins[0]);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/config/payments', (_req, res) => {
    res.json({
      stripeEnabled: isStripeConfigured(),
      publishableKeyConfigured: env.stripePublishableKey.startsWith('pk_'),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.use(errorHandler);

  return app;
}
