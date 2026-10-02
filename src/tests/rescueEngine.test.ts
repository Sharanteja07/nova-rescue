import { describe, it, expect } from 'vitest';
import { applyRescueAction } from '../engine/rescueEngine';
import { getInitialDemoOrders } from '../data/demoOrders';

describe('NOVA RESCUE - Rescue Engine & State Mutation Test Suite', () => {
  it('1. should apply SWITCH_STORE rescue, update store info, recalculate risk, and improve reliability', () => {
    const orders = getInitialDemoOrders();
    // ORD-9401 has high inventory risk (stale inventory > 38h, score ~40-50)
    const order = orders.find(o => o.id === 'ORD-9401')!;
    const initialReliability = order.risk.reliabilityScore;
    const initialCancellation = order.risk.cancellationProbability;

    const rescued = applyRescueAction({
      order,
      actionType: 'SWITCH_STORE',
      details: {
        newStore: {
          storeId: 'STR-BLR-04',
          storeName: 'NOVA Express Indiranagar Central',
          locality: 'Indiranagar 12th Main',
          distanceKm: 2.1,
          inventoryAgeHours: 0.4,
          fulfillmentRate: 0.98,
          estimatedEtaMin: 22,
          reliabilityDelta: +48
        }
      }
    });

    expect(rescued.status).toBe('RESCUED');
    expect(rescued.rescueState).not.toBeNull();
    expect(rescued.rescueState?.applied).toBe(true);
    expect(rescued.rescueState?.actionType).toBe('SWITCH_STORE');
    expect(rescued.store.storeName).toBe('NOVA Express Indiranagar Central');
    expect(rescued.risk.reliabilityScore).toBeGreaterThan(initialReliability);
    expect(rescued.risk.cancellationProbability).toBeLessThan(initialCancellation);
    expect(rescued.rescueState?.explanation).toContain('Eliminates the 35% probability');
  });

  it('2. should apply SUBSTITUTE_PRODUCT rescue, replace unconfirmed SKUs, and eliminate stockout penalty', () => {
    const orders = getInitialDemoOrders();
    const order = orders.find(o => o.id === 'ORD-9401')!;

    const rescued = applyRescueAction({
      order,
      actionType: 'SUBSTITUTE_PRODUCT'
    });

    expect(rescued.status).toBe('RESCUED');
    expect(rescued.rescueState?.actionType).toBe('SUBSTITUTE_PRODUCT');
    // None of the items should remain unconfirmed or stale
    const hasUnconfirmed = rescued.items.some(i => i.stockStatus === 'UNCONFIRMED' || i.stockStatus === 'STALE_STOCK');
    expect(hasUnconfirmed).toBe(false);
    expect(rescued.risk.reliabilityScore).toBeGreaterThan(order.risk.reliabilityScore);
  });

  it('3. should apply ADJUST_DELIVERY rescue, trim ETA, and resolve courier bottlenecks', () => {
    const orders = getInitialDemoOrders();
    // ORD-9402 has high delivery risk (searching rider, heavy rain, 54 min ETA)
    const order = orders.find(o => o.id === 'ORD-9402')!;
    const initialEta = order.delivery.currentEstimatedEtaMin;

    const rescued = applyRescueAction({
      order,
      actionType: 'ADJUST_DELIVERY'
    });

    expect(rescued.status).toBe('RESCUED');
    expect(rescued.delivery.assignedRiderStatus).toBe('ASSIGNED');
    expect(rescued.delivery.currentEstimatedEtaMin).toBeLessThan(initialEta);
    expect(rescued.risk.cancellationProbability).toBeLessThan(order.risk.cancellationProbability);
  });

  it('4. should apply PROACTIVE_NOTIFY rescue and reduce cancellation probability through customer expectation management', () => {
    const orders = getInitialDemoOrders();
    const order = orders.find(o => o.id === 'ORD-9403')!;
    const initialCancellation = order.risk.cancellationProbability;

    const rescued = applyRescueAction({
      order,
      actionType: 'PROACTIVE_NOTIFY'
    });

    expect(rescued.status).toBe('RESCUED');
    expect(rescued.rescueState?.actionType).toBe('PROACTIVE_NOTIFY');
    expect(rescued.risk.cancellationProbability).toBeLessThan(initialCancellation);
    expect(rescued.rescueState?.actionTitle).toContain('Proactive Customer Communication');
  });
});
