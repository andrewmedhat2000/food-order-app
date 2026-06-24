import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password';

describe('password utils', () => {
  it('hashes a password and validates it', async () => {
    const hash = await hashPassword('secret123');
    expect(hash).not.toBe('secret123');
    await expect(comparePassword('secret123', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('secret123');
    await expect(comparePassword('wrong', hash)).resolves.toBe(false);
  });
});
