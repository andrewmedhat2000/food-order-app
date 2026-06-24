import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array();
    const message = details.map((error) => error.msg).join('. ');

    res.status(400).json({
      message: message || 'Validation failed',
      errors: details,
    });
    return;
  }
  next();
}
