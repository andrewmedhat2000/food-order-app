import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './jwt';

describe('jwt utils', () => {
  it('signs and verifies a token payload', () => {
    const token = signToken({ userId: '507f1f77bcf86cd799439011', role: 'customer' });
    const payload = verifyToken(token);

    expect(payload.userId).toBe('507f1f77bcf86cd799439011');
    expect(payload.role).toBe('customer');
  });

  it('throws for an invalid token', () => {
    expect(() => verifyToken('invalid.token.value')).toThrow();
  });
});
