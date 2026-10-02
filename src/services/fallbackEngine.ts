/**
 * NOVA RESCUE - Deterministic Fallback Reasoning Engine
 * Delivers structured business diagnosis & rescue recommendations
 * when external AI API is unavailable or offline.
 */

import { Order, AIAnalysisResult, RescueActionType } from '../types';

/**
 * Validates whether an AI or fallback response matches the required schema.
 */
export function validateAIAnalysisSchema(data: any): data is AIAnalysisResult {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.risk_summary !== 'string' || !data.risk_summary.trim()) return false;
  if (typeof data.primary_risk !== 'string' || !data.primary_risk.trim()) return false;
  if (!Array.isArray(data.risk_drivers) || data.risk_drivers.length === 0) return false;
  if (typeof data.root_cause !== 'string' || !data.root_cause.trim()) return false;
  if (typeof data.recommended_action !== 'string') return false;
  if (typeof data.reason !== 'string' || !data.reason.trim()) return false;
  if (typeof data.expected_effect !== 'string' || !data.expected_effect.trim()) return false;

  const validActions: RescueActionType[] = [
    'SWITCH_STORE',
    'SUBSTITUTE_PRODUCT',
    'PROACTIVE_NOTIFY',
    'ADJUST_DELIVERY',
    'PROCEED'
  ];

  return validActions.includes(data.recommended_action as RescueActionType);
}

/**
 * Generates deterministic business diagnosis and rescue action based on local order data.
 */
export function generateFallbackAnalysis(order: Order): AIAnalysisResult {
  const { items, store, delivery, customer, risk } = order;

  const unconfirmedItems = items.filter(
    i => i.isHighRiskItem || i.stockStatus === 'UNCONFIRMED' || i.stockStatus === 'STALE_STOCK'
  );
  const syncAge = Math.max(store.inventoryLastUpdatedHoursAgo, ...items.map(i => i.inventorySyncAgeHours));
  const etaDelay = delivery.etaDelayMin;
  const is3rdOrder = customer.retentionMilestone === '3rd_ORDER_CRITICAL_MILESTONE' || customer.totalCompletedOrders === 2;

  let recommendedAction: RescueActionType = 'PROCEED';
  let primaryRisk = risk.primaryRisk;
  let rootCause = '';
  let riskSummary = '';
  let reason = '';
  let expectedEffect = '';
  const riskDrivers: string[] = [];

  // Determine dominating operational failure vector
  if (risk.scenarioFactors.inventoryRisk >= 60 || unconfirmedItems.length > 0 || syncAge > 24) {
    // Inventory failure scenario
    riskDrivers.push(`Store inventory last synced ${syncAge.toFixed(1)} hrs ago (threshold: 24h)`);
    if (unconfirmedItems.length > 0) {
      riskDrivers.push(`${unconfirmedItems.length} unconfirmed high-demand item(s): ${unconfirmedItems.map(i => i.name).join(', ')}`);
    }
    riskDrivers.push(`Partner store historical rejection rate: ${(store.rejectionRate * 100).toFixed(0)}%`);

    if (unconfirmedItems.length > 1 && syncAge > 36) {
      recommendedAction = 'SWITCH_STORE';
      primaryRisk = 'Imminent Store Stockout & Catalog Desynchronization';
      rootCause = `Store "${store.storeName}" has not synchronized physical inventory in ${syncAge.toFixed(1)} hours. Cart contains ${unconfirmedItems.length} unconfirmed fast-moving SKUs that are physically absent from store shelves, triggering NOVA CART's primary cancellation pathway (35% of total platform churn).`;
      reason = `Switching fulfillment to a verified partner hub with inventory synchronized under 1 hour guarantees physical SKU availability, bypassing merchant order cancellation.`;
      expectedEffect = `Eliminates the 35% probability of item unavailability cancellation and improves fulfillment reliability from ${risk.reliabilityScore}% to >92%.`;
    } else {
      recommendedAction = 'SUBSTITUTE_PRODUCT';
      primaryRisk = 'Unconfirmed High-Demand SKU at Risk of Rejection';
      rootCause = `The requested SKU (${unconfirmedItems[0]?.name ?? 'Dairy item'}) has an availability confidence of only ${unconfirmedItems[0]?.availabilityConfidence ?? 35}%. Store merchant is likely to reject or partially drop this line item.`;
      reason = `Direct substitution with verified equivalent SKU prevents store clerk rejection while preserving customer cart completeness.`;
      expectedEffect = `Protects 100% of order value (₹${order.orderValue}) and prevents customer post-order disappointment (which affects 29% of surveyed shoppers).`;
    }
  } else if (risk.scenarioFactors.deliveryDelayRisk >= 55 || etaDelay >= 15 || delivery.currentEstimatedEtaMin > 45) {
    // Delivery delay scenario
    recommendedAction = 'ADJUST_DELIVERY';
    primaryRisk = 'Severe Transit Delay & Delivery SLA Breach';
    riskDrivers.push(`Projected ETA is ${delivery.currentEstimatedEtaMin} mins (+${etaDelay} min SLA breach)`);
    riskDrivers.push(`Rider status: ${delivery.assignedRiderStatus} | Weather: ${delivery.weatherCondition}`);
    riskDrivers.push(`Congestion level: ${delivery.trafficCongestion}`);

    rootCause = `Extreme environmental or allocation friction (${delivery.weatherCondition.toLowerCase().replace('_', ' ')} with ${delivery.assignedRiderStatus.toLowerCase().replace('_', ' ')}) has inflated delivery time to ${delivery.currentEstimatedEtaMin} minutes, exceeding NOVA CART's 37-minute degradation threshold. 27% of platform cancellations stem directly from delivery delays.`;
    reason = `Dynamic dispatch of a dedicated priority express rider and traffic re-routing mitigates bottlenecks before the customer initiates self-service order cancellation.`;
    expectedEffect = `Trims 12-16 minutes off projected transit time, bringing order arrival back within acceptable consumer window and reducing cancellation risk by >60%.`;
  } else if (risk.scenarioFactors.storeReliabilityRisk >= 50 || store.rejectionRate > 0.12) {
    // Store friction scenario
    recommendedAction = 'SWITCH_STORE';
    primaryRisk = 'High Merchant Rejection Rate & Catalog Maintenance Friction';
    riskDrivers.push(`Store rejection history is ${(store.rejectionRate * 100).toFixed(0)}% (norm <3%)`);
    riskDrivers.push(`Average packing prep time: ${store.averagePrepTimeMin} mins`);
    riskDrivers.push(`Partner status flagged: ${store.activePartnerStatus}`);

    rootCause = `Store "${store.storeName}" exhibits a ${(store.rejectionRate * 100).toFixed(0)}% rejection rate and prolonged packing time (${store.averagePrepTimeMin}m), aligning with the 39% of partner merchants who report online catalog maintenance is too burdensome.`;
    reason = `Re-routing this order to a high-compliance tier-1 partner store eliminates merchant acceptance drop-off.`;
    expectedEffect = `Cuts rejection hazard to <2% and accelerates fulfillment dispatch by 10 minutes.`;
  } else if (risk.reliabilityScore < 75) {
    recommendedAction = 'PROACTIVE_NOTIFY';
    primaryRisk = 'Customer Expectation Gap & Moderate Delay';
    riskDrivers.push(`Projected delivery delay of +${etaDelay} minutes`);
    riskDrivers.push(`Customer retention status: ${customer.retentionMilestone}`);

    rootCause = `Order is experiencing mild operational friction. Without real-time transparency, customers perceive order stalling and generate support tickets or cancel prematurely.`;
    reason = `Proactively messaging ${customer.customerName} with live revised transit tracking and courtesy priority credit resets expectations and halts inbound ticket creation.`;
    expectedEffect = `Eliminates expected support inquiry (saving ₹120 handling cost) and maintains customer trust.`;
  } else {
    recommendedAction = 'PROCEED';
    primaryRisk = 'Nominal Operational State';
    riskDrivers.push('Fresh inventory synchronization (<1 hr)');
    riskDrivers.push('Assigned courier in transit on-time');
    riskDrivers.push('Store fulfillment rate > 98%');

    rootCause = `Operational telemetry across inventory, store preparation, and courier transit indicates an on-track delivery fulfilling NOVA CART quality standards.`;
    reason = `No active intervention required; system continues standard telemetry surveillance.`;
    expectedEffect = `Order proceeds to delivery within standard SLA window (estimated ${delivery.currentEstimatedEtaMin} min).`;
  }

  // Format risk summary with retention milestone context
  const retentionContext = is3rdOrder
    ? ` CRITICAL RETENTION STAKE: Customer ${customer.customerName} is on Order #3, which carries a 72% probability of month-over-month retention if fulfilled reliably.`
    : '';

  riskSummary = `Order ${order.id} (₹${order.orderValue}) flagged with Reliability Score of ${risk.reliabilityScore}/100 and ${risk.cancellationProbability}% cancellation probability.${retentionContext}`;

  return {
    risk_summary: riskSummary,
    primary_risk: primaryRisk,
    risk_drivers: riskDrivers,
    root_cause: rootCause,
    recommended_action: recommendedAction,
    reason,
    expected_effect: expectedEffect,
    source: 'DETERMINISTIC_FALLBACK',
    modelUsed: 'Deterministic Operations Rule Engine',
    timestamp: new Date().toISOString()
  };
}
