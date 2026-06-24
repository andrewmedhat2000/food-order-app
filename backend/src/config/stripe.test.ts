import { describe, it, expect } from 'vitest';
import { isStripeConfigured } from './stripe';

describe('stripe config', () => {
  it('reports stripe as disabled when secret key is empty in test env', () => {
    expect(isStripeConfigured()).toBe(false);
  });
});
