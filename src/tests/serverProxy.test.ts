import { describe, it, expect } from 'vitest';
import { processServerOrderAnalysis, validateStructuredSchema } from '../../server/geminiProxy';
import { getInitialDemoOrders } from '../data/demoOrders';

describe('NOVA RESCUE - Server-Side Gemini Proxy Security Tests', () => {
  it('1. should securely fall back when no API key is configured on server', async () => {
    const orders = getInitialDemoOrders();
    const result = await processServerOrderAnalysis(orders[0], undefined);

    expect(result.fallback).toBe(true);
    expect(result.source).toBe('DETERMINISTIC_FALLBACK');
    expect(result.error).toContain('GEMINI_API_KEY not configured on server');
  });

  it('2. should reject empty or placeholder API key and safely fall back', async () => {
    const orders = getInitialDemoOrders();
    const result = await processServerOrderAnalysis(orders[0], 'your_gemini_api_key_here');

    expect(result.fallback).toBe(true);
    expect(result.source).toBe('DETERMINISTIC_FALLBACK');
  });

  it('3. should validate structured operational schema correctly', () => {
    const valid = {
      risk_summary: 'Stale stock detected',
      primary_risk: 'Inventory Risk',
      risk_drivers: ['38.5h sync age'],
      root_cause: 'Merchant unconfirmed line items',
      recommended_action: 'SWITCH_STORE',
      reason: 'Guarantees SKU availability',
      expected_effect: 'Reduces cancellation rate'
    };

    expect(validateStructuredSchema(valid)).toBe(true);

    // Missing fields
    expect(validateStructuredSchema({ risk_summary: 'test' })).toBe(false);
    // Invalid action
    expect(validateStructuredSchema({ ...valid, recommended_action: 'UNKNOWN_ACTION' })).toBe(false);
  });
});
