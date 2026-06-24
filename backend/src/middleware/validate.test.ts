import { describe, it, expect, vi } from 'vitest';
import { validate } from './validate';
import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

vi.mock('express-validator', async () => {
  const actual = await vi.importActual<typeof import('express-validator')>('express-validator');
  return {
    ...actual,
    validationResult: vi.fn(),
  };
});

describe('validate middleware', () => {
  it('returns 400 with joined validation messages', () => {
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Email is required' }, { msg: 'Password is required' }],
    } as ReturnType<typeof validationResult>);

    const req = {} as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status, json } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: 'Email is required. Password is required',
      errors: [{ msg: 'Email is required' }, { msg: 'Password is required' }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when validation passes', () => {
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as ReturnType<typeof validationResult>);

    const req = {} as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status, json } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});
