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
const VERCEL_ORIGIN = /^https:\/\/[\w.-]+\.vercel\.app$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.allowedOrigins.includes(origin)) return true;
  if (LOCALHOST_ORIGIN.test(origin)) return true;
  if (VERCEL_ORIGIN.test(origin)) return true;
  return false;
}

function shouldConnectDatabase(req: { method: string; path: string }): boolean {
  if (req.method === 'OPTIONS') return false;
  if (req.path === '/api/health') return false;
  return true;
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

  if (process.env.VERCEL) {
    app.use(async (req, res, next) => {
      if (!shouldConnectDatabase(req)) {
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
