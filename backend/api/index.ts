import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../src/config/database';
import { createApp } from '../src/app';

const app = createApp();
let initPromise: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!initPromise) {
    initPromise = connectDatabase();
  }
  return initPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureReady();
  return app(req, res);
}
