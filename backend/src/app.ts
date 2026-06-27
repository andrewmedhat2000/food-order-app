import express, { Express } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { isStripeConfigured } from './config/stripe';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VERCEL_ORIGIN = /^https:\/\/[\w-]+[\w.-]*\.vercel\.app$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && LOCALHOST_ORIGIN.test(origin)) return true;
  if (process.env.NODE_ENV === 'production' && VERCEL_ORIGIN.test(origin)) {
    return true;
  }
  return false;
}

export function createApp(): Express {
  const app = express();

  if (process.env.VERCEL) {
    app.use(async (req, res, next) => {
      if (req.path === '/api/health') {
        next();
        return;
      }
      try {
        await connectDatabase();
        next();
      } catch (err) {
        next(err);
      }
    });
  }

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

  app.get('/api/health', async (_req, res) => {
    try {
      await connectDatabase();
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        database: 'failed',
        message: err instanceof Error ? err.message : 'Database connection failed',
      });
    }
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
