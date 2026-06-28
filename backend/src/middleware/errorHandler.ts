import { NextFunction, Request, Response } from 'express';

const VERCEL_ORIGIN = /^https:\/\/[\w.-]+\.vercel\.app$/;

function applyCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin;
  if (!origin) return;

  const allowed = [
    ...(process.env.CLIENT_URL ?? '').split(',').map((value) => value.trim()).filter(Boolean),
    ...(process.env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean),
  ];
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (allowed.includes(origin) || VERCEL_ORIGIN.test(origin) || isLocalhost) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  applyCorsHeaders(req, res);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ message });
}
