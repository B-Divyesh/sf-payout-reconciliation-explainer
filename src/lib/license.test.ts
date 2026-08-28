import { describe, expect, it } from 'vitest';
import { billingBase, checkoutUrl } from './license';

describe('production billing route', () => {
  it('uses the enabled production Sociobot host unless a build explicitly overrides it', () => {
    expect(billingBase).toBe('https://api.sociobot.in');
    expect(checkoutUrl).toBe('https://api.sociobot.in/api/v1/products/payout-reconciliation-explainer/checkout');
  });
});
