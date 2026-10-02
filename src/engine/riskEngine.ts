/**
 * NOVA RESCUE - Deterministic Rule-Based Risk Engine
 * Transparent, explainable scoring engine evaluating operational risk factors:
 * 1. Inventory freshness & product availability
 * 2. Store reliability & partner friction
 * 3. Delivery delays & environmental conditions
 * 4. Customer retention stakes (72% 3rd-order milestone)
 */

import {
  OrderItem,
  StoreContext,
  DeliveryConditions,
  CustomerContext,
  OrderRiskEvaluation,
  RiskDriverBreakdown,
  RiskLevel
} from '../types';

/**
 * Calculates inventory risk score (0 - 100).
 * Driven by:
 * - Sync age (hours since store last updated stock)
 * - Average item availability confidence
 * - Stale/unconfirmed stock penalties
 */
export function calculateInventoryRisk(items: OrderItem[], store: StoreContext): {
  score: number;
  drivers: RiskDriverBreakdown[];
} {
  if (!items || items.length === 0) {
    return {
      score: 100,
      drivers: [{
        category: 'INVENTORY',
        label: 'Empty Cart Error',
        severity: 'CRITICAL',
        description: 'Order contains no items or invalid cart payload.',
        scoreContribution: 100,
        metricValue: '0 items'
      }]
    };
  }

  const drivers: RiskDriverBreakdown[] = [];

  // 1. Inventory Freshness Factor (Store & Item sync age)
  // Case insight: Some partner stores update inventory only once every 1–3 days (24-72 hrs).
  const syncAgeHours = Math.max(
    store?.inventoryLastUpdatedHoursAgo ?? 0,
    ...items.map(i => i.inventorySyncAgeHours ?? 0)
  );

  let syncAgeScore = 0;
  if (syncAgeHours > 48) {
    syncAgeScore = 95;
    drivers.push({
      category: 'INVENTORY',
      label: 'Critically Stale Inventory',
      severity: 'CRITICAL',
      description: `Store inventory last synced ${syncAgeHours.toFixed(1)} hrs ago (>48 hrs). High stockout probability.`,
      scoreContribution: 40,
      metricValue: `${syncAgeHours.toFixed(1)} hrs ago`
    });
  } else if (syncAgeHours > 24) {
    syncAgeScore = 75;
    drivers.push({
      category: 'INVENTORY',
      label: 'Stale Inventory Sync',
      severity: 'HIGH',
      description: `Inventory updated ${syncAgeHours.toFixed(1)} hrs ago (>24 hrs threshold). 35% of platform cancellations trace to stockouts.`,
      scoreContribution: 30,
      metricValue: `${syncAgeHours.toFixed(1)} hrs ago`
    });
  } else if (syncAgeHours > 8) {
    syncAgeScore = 40;
    drivers.push({
      category: 'INVENTORY',
      label: 'Moderate Inventory Age',
      severity: 'MEDIUM',
      description: `Inventory updated ${syncAgeHours.toFixed(1)} hrs ago. Minor discrepancy risk.`,
      scoreContribution: 15,
      metricValue: `${syncAgeHours.toFixed(1)} hrs ago`
    });
  } else {
    syncAgeScore = 10;
  }

  // 2. Product Availability Confidence
  const avgConfidence = items.reduce((acc, item) => acc + (item.availabilityConfidence ?? 100), 0) / items.length;
  const confidenceScore = Math.max(0, Math.min(100, (100 - avgConfidence) * 1.1));

  const unconfirmedItems = items.filter(i => i.stockStatus === 'UNCONFIRMED' || i.stockStatus === 'STALE_STOCK');
  if (unconfirmedItems.length > 0) {
    drivers.push({
      category: 'INVENTORY',
      label: 'Unconfirmed SKU Availability',
      severity: unconfirmedItems.length > 1 ? 'CRITICAL' : 'HIGH',
      description: `${unconfirmedItems.length} item(s) unconfirmed: ${unconfirmedItems.map(i => i.name).join(', ')}.`,
      scoreContribution: unconfirmedItems.length * 15,
      metricValue: `${Math.round(avgConfidence)}% avg confidence`
    });
  }

  // 3. Composite Inventory Risk
  const composite = (syncAgeScore * 0.50) + (confidenceScore * 0.50);
  const finalScore = Math.round(Math.min(100, Math.max(0, composite)));

  return { score: finalScore, drivers };
}

/**
 * Calculates store reliability risk score (0 - 100).
 * Driven by:
 * - Partner store rejection history
 * - Historical order fulfillment rate
 * - Partner friction status (39% stores say online inventory is too burdensome)
 * - Average prep time
 */
export function calculateStoreRisk(store: StoreContext): {
  score: number;
  drivers: RiskDriverBreakdown[];
} {
  if (!store) {
    return {
      score: 100,
      drivers: [{
        category: 'STORE_RELIABILITY',
        label: 'Missing Store Context',
        severity: 'CRITICAL',
        description: 'No store metadata found for this order.',
        scoreContribution: 100,
        metricValue: 'Unknown Store'
      }]
    };
  }

  const drivers: RiskDriverBreakdown[] = [];

  // Rejection rate (Normal quick-comm benchmark: < 3%)
  const rejectionRate = store.rejectionRate ?? 0;
  let rejectionScore = 0;
  if (rejectionRate > 0.12) {
    rejectionScore = 90;
    drivers.push({
      category: 'STORE_RELIABILITY',
      label: 'High Store Rejection Rate',
      severity: 'HIGH',
      description: `Store rejects ${(rejectionRate * 100).toFixed(0)}% of incoming orders (benchmark < 3%).`,
      scoreContribution: 35,
      metricValue: `${(rejectionRate * 100).toFixed(0)}% rejections`
    });
  } else if (rejectionRate > 0.06) {
    rejectionScore = 50;
    drivers.push({
      category: 'STORE_RELIABILITY',
      label: 'Elevated Order Rejection Rate',
      severity: 'MEDIUM',
      description: `Store rejection rate is ${(rejectionRate * 100).toFixed(0)}%, above acceptable threshold.`,
      scoreContribution: 20,
      metricValue: `${(rejectionRate * 100).toFixed(0)}%`
    });
  } else {
    rejectionScore = 15;
  }

  // Fulfillment rate
  const fulfillmentRate = store.historicalFulfillmentRate ?? 1.0;
  const fulfillmentPenalty = Math.max(0, (1 - fulfillmentRate) * 200);

  // Partner friction status
  let frictionScore = 10;
  if (store.activePartnerStatus === 'HIGH_FRICTION') {
    frictionScore = 80;
    drivers.push({
      category: 'STORE_RELIABILITY',
      label: 'Partner Catalog Friction',
      severity: 'HIGH',
      description: 'Store operator flagged catalog maintenance friction; manual order acceptance delays expected.',
      scoreContribution: 25,
      metricValue: 'High Friction'
    });
  } else if (store.activePartnerStatus === 'DEGRADED') {
    frictionScore = 50;
  }

  // Prep time
  const prepTime = store.averagePrepTimeMin ?? 10;
  let prepScore = 10;
  if (prepTime > 20) {
    prepScore = 75;
    drivers.push({
      category: 'STORE_RELIABILITY',
      label: 'Prolonged Store Prep Time',
      severity: 'MEDIUM',
      description: `Avg store packing time is ${prepTime} min (platform norm: 7-10 min).`,
      scoreContribution: 15,
      metricValue: `${prepTime} min prep`
    });
  }

  const composite = (rejectionScore * 0.40) + (fulfillmentPenalty * 0.30) + (frictionScore * 0.15) + (prepScore * 0.15);
  const finalScore = Math.round(Math.min(100, Math.max(0, composite)));

  return { score: finalScore, drivers };
}

/**
 * Calculates delivery delay risk score (0 - 100).
 * Driven by:
 * - Current ETA vs standard promised SLA (29 min -> 37 min platform average)
 * - Assigned rider availability
 * - Weather conditions (rain, waterlogging)
 * - Traffic congestion
 */
export function calculateDeliveryRisk(delivery: DeliveryConditions): {
  score: number;
  drivers: RiskDriverBreakdown[];
} {
  if (!delivery) {
    return {
      score: 100,
      drivers: [{
        category: 'DELIVERY',
        label: 'Missing Delivery Context',
        severity: 'CRITICAL',
        description: 'No delivery telemetry available.',
        scoreContribution: 100,
        metricValue: 'Unknown Delivery'
      }]
    };
  }

  const drivers: RiskDriverBreakdown[] = [];

  // Delay delta
  const delayMin = delivery.etaDelayMin ?? Math.max(0, (delivery.currentEstimatedEtaMin ?? 0) - (delivery.standardEtaMin ?? 0));
  let delayScore = 0;

  if (delayMin >= 20 || (delivery.currentEstimatedEtaMin ?? 0) > 50) {
    delayScore = 95;
    drivers.push({
      category: 'DELIVERY',
      label: 'Critical Delivery Delay (>20m)',
      severity: 'CRITICAL',
      description: `Projected ETA is ${delivery.currentEstimatedEtaMin} min (+${delayMin}m over promise). 27% of cancellations caused by delivery delay.`,
      scoreContribution: 40,
      metricValue: `${delivery.currentEstimatedEtaMin} min ETA (+${delayMin}m)`
    });
  } else if (delayMin >= 10 || (delivery.currentEstimatedEtaMin ?? 0) > 40) {
    delayScore = 70;
    drivers.push({
      category: 'DELIVERY',
      label: 'Substantial SLA Breach',
      severity: 'HIGH',
      description: `Projected ETA is ${delivery.currentEstimatedEtaMin} min (+${delayMin}m delay). Approaching cancellation threshold.`,
      scoreContribution: 25,
      metricValue: `+${delayMin} min delay`
    });
  } else if (delayMin >= 5) {
    delayScore = 40;
    drivers.push({
      category: 'DELIVERY',
      label: 'Minor Delivery Delay',
      severity: 'MEDIUM',
      description: `Projected ETA is ${delivery.currentEstimatedEtaMin} min (+${delayMin}m delay).`,
      scoreContribution: 10,
      metricValue: `+${delayMin} min`
    });
  } else {
    delayScore = 10;
  }

  // Environmental and Rider factors
  if (delivery.weatherCondition === 'HEAVY_RAIN' || delivery.weatherCondition === 'WATERLOGGING') {
    delayScore = Math.min(100, delayScore + 25);
    drivers.push({
      category: 'DELIVERY',
      label: 'Monsoon Transit Impairment',
      severity: 'HIGH',
      description: `Adverse weather (${delivery.weatherCondition.toLowerCase().replace('_', ' ')}) causing road slowdowns.`,
      scoreContribution: 20,
      metricValue: delivery.weatherCondition
    });
  }

  if (delivery.assignedRiderStatus === 'SEARCHING' || delivery.assignedRiderStatus === 'DELAYED_PICKUP') {
    delayScore = Math.min(100, delayScore + 25);
    drivers.push({
      category: 'DELIVERY',
      label: 'Rider Allocation Bottleneck',
      severity: 'HIGH',
      description: `Rider status is ${delivery.assignedRiderStatus}. Store pickup dispatch not confirmed.`,
      scoreContribution: 25,
      metricValue: delivery.assignedRiderStatus
    });
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, delayScore)));
  return { score: finalScore, drivers };
}

/**
 * Customer retention stake assessment.
 * Highlight the 72% repeat order rate for customers completing 3 orders.
 */
export function assessCustomerRetentionStake(customer: CustomerContext): RiskDriverBreakdown | null {
  if (!customer) return null;

  if (customer.retentionMilestone === '3rd_ORDER_CRITICAL_MILESTONE' || customer.totalCompletedOrders === 2) {
    return {
      category: 'RETENTION_STAKE',
      label: 'Critical 3rd-Order Retention Milestone',
      severity: 'CRITICAL',
      description: 'Customer completing 3rd order has a 72% probability of becoming a sustained repeat buyer. Order failure permanently impairs repeat rate.',
      scoreContribution: 30,
      metricValue: 'Order #3 (72% Repeat Stake)'
    };
  }

  if (customer.retentionMilestone === '1st_ORDER_NEW' || customer.totalCompletedOrders === 0) {
    return {
      category: 'RETENTION_STAKE',
      label: 'First-Time Customer Acquisition',
      severity: 'MEDIUM',
      description: 'First order experience dictates future retention. Early operational friction causes drop-off.',
      scoreContribution: 15,
      metricValue: '1st Order'
    };
  }

  return null;
}

/**
 * Full deterministic rule-based evaluation of an order.
 * Outputs:
 * - Reliability score (0-100, higher is safer)
 * - Risk score (100 - reliabilityScore)
 * - Risk level (LOW, MEDIUM, HIGH, CRITICAL)
 * - Cancellation probability
 * - Primary risk classification
 * - Granular risk driver breakdown
 */
export function evaluateOrderRisk(
  items: OrderItem[],
  store: StoreContext,
  delivery: DeliveryConditions,
  customer?: CustomerContext
): OrderRiskEvaluation {
  // Input validation
  if (!items || !store || !delivery) {
    return {
      reliabilityScore: 0,
      riskScore: 100,
      riskLevel: 'CRITICAL',
      cancellationProbability: 95,
      primaryRisk: 'Invalid Order Context',
      riskDrivers: [{
        category: 'INVENTORY',
        label: 'Malformed Order Data',
        severity: 'CRITICAL',
        description: 'Essential context (items, store, or delivery) is missing.',
        scoreContribution: 100,
        metricValue: 'Missing Payload'
      }],
      scenarioFactors: {
        inventoryRisk: 100,
        storeReliabilityRisk: 100,
        deliveryDelayRisk: 100
      }
    };
  }

  const invResult = calculateInventoryRisk(items, store);
  const storeResult = calculateStoreRisk(store);
  const delResult = calculateDeliveryRisk(delivery);

  // Combine drivers
  const allDrivers: RiskDriverBreakdown[] = [
    ...invResult.drivers,
    ...storeResult.drivers,
    ...delResult.drivers
  ];

  if (customer) {
    const retentionDriver = assessCustomerRetentionStake(customer);
    if (retentionDriver) {
      allDrivers.push(retentionDriver);
    }
  }

  // Sort drivers by score contribution descending
  allDrivers.sort((a, b) => b.scoreContribution - a.scoreContribution);

  // Weighted composite risk formula:
  // 40% inventory + 30% store reliability + 30% delivery delay
  const rawRiskScore = (invResult.score * 0.40) + (storeResult.score * 0.30) + (delResult.score * 0.30);
  const riskScore = Math.round(Math.min(100, Math.max(0, rawRiskScore)));
  const reliabilityScore = Math.max(0, 100 - riskScore);

  // Determine risk level
  let riskLevel: RiskLevel = 'LOW';
  if (reliabilityScore < 40) {
    riskLevel = 'CRITICAL';
  } else if (reliabilityScore < 60) {
    riskLevel = 'HIGH';
  } else if (reliabilityScore < 75) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Cancellation probability calibrated to NOVA CART case:
  // Base rate on platform is 11%. Range from 4% for healthy to 88% for critical multi-factor failures.
  let cancellationProbability = 0;
  if (reliabilityScore >= 80) {
    cancellationProbability = Math.round(4 + (100 - reliabilityScore) * 0.2); // 4% - 8%
  } else if (reliabilityScore >= 60) {
    cancellationProbability = Math.round(10 + (80 - reliabilityScore) * 0.7); // 10% - 24%
  } else if (reliabilityScore >= 40) {
    cancellationProbability = Math.round(25 + (60 - reliabilityScore) * 1.5); // 25% - 55%
  } else {
    cancellationProbability = Math.round(55 + (40 - reliabilityScore) * 0.85); // 55% - 89%
  }
  cancellationProbability = Math.min(95, Math.max(3, cancellationProbability));

  // Primary risk classification
  let primaryRisk = 'Optimal Operational Conditions';
  if (allDrivers.length > 0) {
    const topDriver = allDrivers[0];
    primaryRisk = `${topDriver.category.replace('_', ' ')}: ${topDriver.label}`;
  }

  return {
    reliabilityScore,
    riskScore,
    riskLevel,
    cancellationProbability,
    primaryRisk,
    riskDrivers: allDrivers,
    scenarioFactors: {
      inventoryRisk: invResult.score,
      storeReliabilityRisk: storeResult.score,
      deliveryDelayRisk: delResult.score
    }
  };
}
