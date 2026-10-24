import { describe, expect, it } from 'vitest';
import { validatePurchase } from '../src/modules/inventory/rules.js';

describe('purchase rules', () => {
  it('rejects zero and negative quantities', () => {
    expect(() => validatePurchase(5, 0)).toThrow('positive integer');
    expect(() => validatePurchase(5, -1)).toThrow('positive integer');
  });
  it('rejects purchases exceeding stock', () => {
    expect(() => validatePurchase(1, 2)).toThrow('Insufficient stock');
  });
  it('returns remaining stock', () => {
    expect(validatePurchase(3, 2)).toBe(1);
  });
});
