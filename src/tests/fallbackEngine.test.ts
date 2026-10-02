import { describe, it, expect } from 'vitest';
import { generateFallbackAnalysis, validateAIAnalysisSchema } from '../services/fallbackEngine';
import { getInitialDemoOrders } from '../data/demoOrders';

describe('NOVA RESCUE - AI & Fallback Reasoning Engine Test Suite', () => {
  it('1. should validate correct structured JSON schema for operational analysis', () => {
    const validData = {
      risk_summary: 'High risk detected due to stale inventory sync age.',
      primary_risk: 'Inventory Desynchronization',
      risk_drivers: ['Inventory sync age > 38 hrs', '2 unconfirmed dairy SKUs'],
      root_cause: 'Merchant has not synchronized physical store stock.',
      recommended_action: 'SWITCH_STORE',
      reason: 'Alternative store has verified fresh inventory.',
      expected_effect: 'Reduces cancellation probability from 68% to 12%.'
    };

    expect(validateAIAnalysisSchema(validData)).toBe(true);
  });

  it('2. should reject invalid or incomplete schemas', () => {
    expect(validateAIAnalysisSchema(null)).toBe(false);
    expect(validateAIAnalysisSchema({})).toBe(false);
    expect(validateAIAnalysisSchema({ risk_summary: 'only one field' })).toBe(false);
    // Invalid action
    expect(validateAIAnalysisSchema({
      risk_summary: 'Test',
      primary_risk: 'Test',
      risk_drivers: ['Driver 1'],
      root_cause: 'Cause',
      recommended_action: 'INVALID_RANDOM_ACTION',
      reason: 'Reason',
      expected_effect: 'Effect'
    })).toBe(false);
  });

  it('3. should generate deterministic diagnosis when AI service is unavailable', () => {
    const orders = getInitialDemoOrders();
    // Test with high inventory risk order
    const orderInv = orders.find(o => o.id === 'ORD-9401')!;
    const analysisInv = generateFallbackAnalysis(orderInv);

    expect(analysisInv.source).toBe('DETERMINISTIC_FALLBACK');
    expect(analysisInv.primary_risk).toBeDefined();
    expect(analysisInv.root_cause).toContain('35%');
    expect(analysisInv.risk_drivers.length).toBeGreaterThan(0);
    expect(['SWITCH_STORE', 'SUBSTITUTE_PRODUCT']).toContain(analysisInv.recommended_action);
    expect(validateAIAnalysisSchema(analysisInv)).toBe(true);

    // Test with high delivery risk order
    const orderDel = orders.find(o => o.id === 'ORD-9402')!;
    const analysisDel = generateFallbackAnalysis(orderDel);
    expect(analysisDel.recommended_action).toBe('ADJUST_DELIVERY');
    expect(analysisDel.root_cause).toContain('27%');
    expect(validateAIAnalysisSchema(analysisDel)).toBe(true);
  });
});
