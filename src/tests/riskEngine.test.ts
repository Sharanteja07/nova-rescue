import { describe, it, expect } from 'vitest';
import {
  calculateInventoryRisk,
  calculateStoreRisk,
  calculateDeliveryRisk,
  evaluateOrderRisk,
  assessCustomerRetentionStake
} from '../engine/riskEngine';
import { OrderItem, StoreContext, DeliveryConditions, CustomerContext } from '../types';

describe('NOVA RESCUE - Risk Engine Test Suite', () => {
  const mockStoreHealthy: StoreContext = {
    storeId: 'STR-01',
    storeName: 'NOVA Fresh Metro Hub',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    inventoryLastUpdatedHoursAgo: 0.5,
    historicalFulfillmentRate: 0.99,
    rejectionRate: 0.01,
    averagePrepTimeMin: 7,
    activePartnerStatus: 'RELIABLE',
    distanceKm: 1.5
  };

  const mockStoreStale: StoreContext = {
    storeId: 'STR-02',
    storeName: 'Local Corner Store',
    city: 'Bengaluru',
    locality: 'Koramangala',
    inventoryLastUpdatedHoursAgo: 42.0, // Stale inventory > 1 day
    historicalFulfillmentRate: 0.82,
    rejectionRate: 0.16,
    averagePrepTimeMin: 22,
    activePartnerStatus: 'HIGH_FRICTION',
    distanceKm: 2.5
  };

  const mockDeliveryOnTime: DeliveryConditions = {
    distanceKm: 1.5,
    assignedRiderStatus: 'ASSIGNED',
    trafficCongestion: 'LOW',
    weatherCondition: 'CLEAR',
    standardEtaMin: 25,
    currentEstimatedEtaMin: 24,
    etaDelayMin: 0
  };

  const mockDeliveryDelayed: DeliveryConditions = {
    distanceKm: 3.5,
    assignedRiderStatus: 'SEARCHING',
    trafficCongestion: 'SEVERE',
    weatherCondition: 'HEAVY_RAIN',
    standardEtaMin: 25,
    currentEstimatedEtaMin: 55, // +30 min delay
    etaDelayMin: 30
  };

  const mockHealthyItems: OrderItem[] = [
    {
      id: 'SKU-01',
      name: 'Amul Butter 500g',
      quantity: 1,
      price: 280,
      category: 'Dairy',
      availabilityConfidence: 99,
      inventorySyncAgeHours: 0.5,
      stockStatus: 'IN_STOCK',
      isHighRiskItem: false
    }
  ];

  const mockStaleItems: OrderItem[] = [
    {
      id: 'SKU-02',
      name: 'Heritage Fresh Milk 1L',
      quantity: 2,
      price: 60,
      category: 'Dairy',
      availabilityConfidence: 30,
      inventorySyncAgeHours: 42.0,
      stockStatus: 'UNCONFIRMED',
      isHighRiskItem: true
    },
    {
      id: 'SKU-03',
      name: 'Aashirvaad Atta 5kg',
      quantity: 1,
      price: 310,
      category: 'Staples',
      availabilityConfidence: 45,
      inventorySyncAgeHours: 42.0,
      stockStatus: 'STALE_STOCK',
      isHighRiskItem: true
    }
  ];

  it('1. should calculate low inventory risk for fresh sync and high availability', () => {
    const result = calculateInventoryRisk(mockHealthyItems, mockStoreHealthy);
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.drivers.length).toBe(0);
  });

  it('2. should detect critical inventory risk when sync age exceeds 24-48 hours and items are unconfirmed', () => {
    const result = calculateInventoryRisk(mockStaleItems, mockStoreStale);
    expect(result.score).toBeGreaterThan(60);
    expect(result.drivers.some(d => d.label.includes('Inventory'))).toBe(true);
    expect(result.drivers.some(d => d.label.includes('Unconfirmed'))).toBe(true);
  });

  it('3. should calculate high store risk for high rejection and partner catalog friction', () => {
    const result = calculateStoreRisk(mockStoreStale);
    expect(result.score).toBeGreaterThan(50);
    expect(result.drivers.some(d => d.label.includes('Rejection'))).toBe(true);
    expect(result.drivers.some(d => d.label.includes('Friction'))).toBe(true);
  });

  it('4. should detect severe delivery risk during rain and rider search bottlenecks', () => {
    const result = calculateDeliveryRisk(mockDeliveryDelayed);
    expect(result.score).toBeGreaterThan(75);
    expect(result.drivers.some(d => d.label.includes('Delivery Delay'))).toBe(true);
    expect(result.drivers.some(d => d.label.includes('Transit Impairment'))).toBe(true);
  });

  it('5. should identify low-risk healthy orders with high reliability score (>= 80)', () => {
    const customer: CustomerContext = {
      customerId: 'CUST-01',
      customerName: 'Aarav Patel',
      phone: '+91 99999 11111',
      totalCompletedOrders: 5,
      retentionMilestone: '4th_PLUS_LOYAL',
      pastCancellationsCount: 0,
      lifetimeValue: 2400
    };

    const evaluation = evaluateOrderRisk(mockHealthyItems, mockStoreHealthy, mockDeliveryOnTime, customer);
    expect(evaluation.reliabilityScore).toBeGreaterThanOrEqual(80);
    expect(evaluation.riskLevel).toBe('LOW');
    expect(evaluation.cancellationProbability).toBeLessThanOrEqual(10);
  });

  it('6. should detect combined high/critical risk and high cancellation probability', () => {
    const customer: CustomerContext = {
      customerId: 'CUST-02',
      customerName: 'Rohan Gupta',
      phone: '+91 99999 22222',
      totalCompletedOrders: 2,
      retentionMilestone: '3rd_ORDER_CRITICAL_MILESTONE',
      pastCancellationsCount: 1,
      lifetimeValue: 970
    };

    const evaluation = evaluateOrderRisk(mockStaleItems, mockStoreStale, mockDeliveryDelayed, customer);
    expect(evaluation.reliabilityScore).toBeLessThan(45);
    expect(['HIGH', 'CRITICAL']).toContain(evaluation.riskLevel);
    expect(evaluation.cancellationProbability).toBeGreaterThan(50);
  });

  it('7. should flag customer 3rd order retention milestone with 72% repeat stake', () => {
    const customer3rdOrder: CustomerContext = {
      customerId: 'CUST-03',
      customerName: 'Priya Nair',
      phone: '+91 99999 33333',
      totalCompletedOrders: 2,
      retentionMilestone: '3rd_ORDER_CRITICAL_MILESTONE',
      pastCancellationsCount: 0,
      lifetimeValue: 980
    };

    const driver = assessCustomerRetentionStake(customer3rdOrder);
    expect(driver).not.toBeNull();
    expect(driver?.label).toContain('3rd-Order Retention Milestone');
    expect(driver?.description).toContain('72% probability');
  });

  it('8. should safely handle invalid or missing order context without crashing', () => {
    // @ts-expect-error Testing invalid inputs
    const evalNull = evaluateOrderRisk(null, null, null);
    expect(evalNull.reliabilityScore).toBe(0);
    expect(evalNull.riskLevel).toBe('CRITICAL');
    expect(evalNull.riskDrivers.some(d => d.label.includes('Malformed'))).toBe(true);

    const emptyItemsResult = calculateInventoryRisk([], mockStoreHealthy);
    expect(emptyItemsResult.score).toBe(100);
    expect(emptyItemsResult.drivers[0].label).toBe('Empty Cart Error');
  });
});
