import { describe, it, expect } from 'vitest';
import { calculateSessionImpact, projectPlatformScenario, NOVA_CART_HISTORICAL_BENCHMARKS } from '../engine/businessImpact';
import { getInitialDemoOrders } from '../data/demoOrders';
import { applyRescueAction } from '../engine/rescueEngine';

describe('NOVA RESCUE - Business Impact & Retention Modeling Test Suite', () => {
  it('1. should calculate live session impact metrics when orders are rescued', () => {
    const orders = getInitialDemoOrders();
    const orderToRescue = orders.find(o => o.id === 'ORD-9401')!;

    const initialMetrics = calculateSessionImpact(orders);
    expect(initialMetrics.ordersRescued).toBe(0);

    const rescuedOrder = applyRescueAction({
      order: orderToRescue,
      actionType: 'SWITCH_STORE'
    });

    const updatedOrders = orders.map(o => o.id === rescuedOrder.id ? rescuedOrder : o);
    const postRescueMetrics = calculateSessionImpact(updatedOrders);

    expect(postRescueMetrics.ordersRescued).toBe(1);
    expect(postRescueMetrics.cancellationsAvoided).toBeGreaterThanOrEqual(1);
    expect(postRescueMetrics.estimatedRevenueProtected).toBe(548); // ORD-9401 value
    expect(postRescueMetrics.retentionOpportunityOrders).toBe(1); // Rahul Sharma is order #3!
  });

  it('2. should model macro platform scenarios aligned with NOVA CART historical benchmarks', () => {
    const projection = projectPlatformScenario(85);

    expect(projection.monthlyOrdersCovered).toBe(Math.round(38500 * 0.85));
    expect(projection.preventableCancellationsMonthly).toBeGreaterThan(1500);
    expect(projection.grossMerchandiseValueSavedINR).toBeGreaterThan(700000);
    expect(projection.supportTicketsAvertedMonthly).toBeGreaterThan(2000);
    expect(projection.projectedCancellationRate).toBeLessThan(NOVA_CART_HISTORICAL_BENCHMARKS.cancellationRateCurrent * 100);
    expect(projection.projectedCancellationRate).toBeGreaterThan(4);
  });
});
