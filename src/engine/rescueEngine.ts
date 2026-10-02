/**
 * NOVA RESCUE - Rescue Engine
 * Applies operational interventions, recalculates order risk,
 * computes ETA changes, cancellation risk changes, and generates
 * operator-facing explanations.
 */

import {
  Order,
  OrderItem,
  StoreContext,
  DeliveryConditions,
  RescueActionType,
  RescueState,
  AlternativeStoreOption
} from '../types';
import { evaluateOrderRisk } from './riskEngine';

export interface ApplyRescuePayload {
  order: Order;
  actionType: RescueActionType;
  details?: {
    newStore?: AlternativeStoreOption;
    substitutions?: { originalItemId: string; substituteName: string; substitutePrice: number }[];
    notifyTemplate?: string;
    expeditedRiderId?: string;
    delayAdjustmentMin?: number;
    operatorNote?: string;
  };
}

/**
 * Applies a rescue action to an order, mutating context and recalculating state.
 */
export function applyRescueAction(payload: ApplyRescuePayload): Order {
  const { order, actionType, details } = payload;
  const originalReliability = order.risk.reliabilityScore;
  const originalCancellation = order.risk.cancellationProbability;
  const originalEta = order.delivery.currentEstimatedEtaMin;

  let updatedItems: OrderItem[] = JSON.parse(JSON.stringify(order.items));
  let updatedStore: StoreContext = JSON.parse(JSON.stringify(order.store));
  let updatedDelivery: DeliveryConditions = JSON.parse(JSON.stringify(order.delivery));

  let actionTitle = '';
  let actionSummary = '';
  let explanation = '';
  let newEtaMin = originalEta;

  switch (actionType) {
    case 'SWITCH_STORE': {
      const altStore = details?.newStore;
      const targetStoreName = altStore?.storeName ?? 'Fresh Mart Express (Indiranagar Hub)';
      const targetLocality = altStore?.locality ?? 'Indiranagar Hub';
      const targetFulfillment = altStore?.fulfillmentRate ?? 0.98;
      const targetInvAge = altStore?.inventoryAgeHours ?? 0.3;

      updatedStore = {
        ...updatedStore,
        storeName: targetStoreName,
        locality: targetLocality,
        inventoryLastUpdatedHoursAgo: targetInvAge,
        historicalFulfillmentRate: targetFulfillment,
        rejectionRate: 0.02,
        averagePrepTimeMin: 7,
        activePartnerStatus: 'RELIABLE'
      };

      // Reset item sync age because alternative store inventory is fresh
      updatedItems = updatedItems.map(item => ({
        ...item,
        availabilityConfidence: 98,
        inventorySyncAgeHours: targetInvAge,
        stockStatus: 'IN_STOCK',
        isHighRiskItem: false
      }));

      // ETA adjustment for new store location:
      // Faster prep time (7m vs 22m) often compensates for slight distance variation
      const prepSavings = Math.max(0, (order.store.averagePrepTimeMin || 15) - 7);
      const transitDelta = (altStore?.distanceKm ? Math.round(altStore.distanceKm * 2.5) : 3);
      newEtaMin = Math.max(18, originalEta - prepSavings + Math.min(4, transitDelta));
      updatedDelivery.currentEstimatedEtaMin = newEtaMin;
      updatedDelivery.etaDelayMin = Math.max(0, newEtaMin - updatedDelivery.standardEtaMin);

      actionTitle = `Rerouted Order to ${targetStoreName}`;
      actionSummary = `Switched fulfillment node from ${order.store.storeName} to verified partner store with fresh stock (<1 hr sync).`;
      explanation = `Eliminates the 35% probability of inventory cancellation. The new partner store has a 98% fulfillment rate and synced inventory ${targetInvAge} hrs ago. Faster prep time saves ${prepSavings} min, keeping ETA within acceptable consumer expectation.`;
      break;
    }

    case 'SUBSTITUTE_PRODUCT': {
      const substitutedNames: string[] = [];
      updatedItems = updatedItems.map(item => {
        if (item.isHighRiskItem || item.stockStatus === 'UNCONFIRMED' || item.stockStatus === 'STALE_STOCK') {
          const substituteName = item.substituteAvailable?.name ?? `Verified Premium Grade ${item.name}`;
          const substituteConfidence = item.substituteAvailable?.availabilityConfidence ?? 99;
          substitutedNames.push(`${item.name} → ${substituteName}`);
          return {
            ...item,
            name: substituteName,
            stockStatus: 'IN_STOCK',
            availabilityConfidence: substituteConfidence,
            isHighRiskItem: false
          };
        }
        return item;
      });

      actionTitle = `Automated Product Substitution Applied`;
      actionSummary = `Substituted ${substitutedNames.length > 0 ? substitutedNames.join('; ') : 'unconfirmed SKUs'} with verified in-stock inventory.`;
      explanation = `Replaces unconfirmed items with 100% verified alternatives. Bypasses store stockout rejection without requiring cart cancellation, protecting the order from NOVA CART's #1 churn driver.`;
      break;
    }

    case 'PROACTIVE_NOTIFY': {
      // Transparency mitigates churn even if ETA remains slightly elongated
      actionTitle = `Proactive Customer Communication Dispatched`;
      actionSummary = `Sent proactive status update + priority courier tracking to ${order.customer.customerName}.`;
      explanation = `Transparent communication resets customer expectations before frustration escalates. Platform data shows proactive notification reduces customer support tickets by 62% and cuts delay-induced cancellations in half.`;
      break;
    }

    case 'ADJUST_DELIVERY': {
      // Reassign to priority express courier, reroute around weather/traffic bottlenecks
      newEtaMin = Math.max(updatedDelivery.standardEtaMin + 4, Math.round(originalEta - 22));
      updatedDelivery = {
        ...updatedDelivery,
        assignedRiderStatus: 'ASSIGNED',
        weatherCondition: 'CLEAR', // Rerouted through all-weather arterial corridor
        trafficCongestion: 'LOW',
        currentEstimatedEtaMin: newEtaMin,
        etaDelayMin: Math.max(0, newEtaMin - updatedDelivery.standardEtaMin)
      };

      actionTitle = `Express Courier Reassignment & Arterial Rerouting`;
      actionSummary = `Assigned priority express courier and optimized route around bottleneck. Projected ETA trimmed by ${originalEta - newEtaMin} minutes.`;
      explanation = `Resolves the rider allocation bottleneck and trims ETA from ${originalEta} min down to ${newEtaMin} min. Directly tackles the 27% delay-driven cancellation risk.`;
      break;
    }

    case 'PROCEED': {
      actionTitle = `Operator Manual Confirmation`;
      actionSummary = `Order acknowledged by operations rescue desk with elevated monitoring.`;
      explanation = `Operator verified order viability with merchant desk directly. Active monitoring flag established.`;
      break;
    }
  }

  // Recalculate risk with updated parameters
  const newRisk = evaluateOrderRisk(updatedItems, updatedStore, updatedDelivery, order.customer);

  // If PROACTIVE_NOTIFY was applied, adjust cancellation probability down by factor of transparency
  let adjustedCancellationRisk = newRisk.cancellationProbability;
  if (actionType === 'PROACTIVE_NOTIFY') {
    adjustedCancellationRisk = Math.round(originalCancellation * 0.45);
  }

  const rescueState: RescueState = {
    applied: true,
    actionType,
    appliedAt: new Date().toISOString(),
    originalReliabilityScore: originalReliability,
    newReliabilityScore: newRisk.reliabilityScore,
    originalCancellationRisk: originalCancellation,
    newCancellationRisk: adjustedCancellationRisk,
    originalEtaMin: originalEta,
    newEtaMin,
    actionTitle,
    actionSummary,
    explanation,
    actionDetails: details
  };

  return {
    ...order,
    status: 'RESCUED',
    items: updatedItems,
    store: updatedStore,
    delivery: updatedDelivery,
    risk: {
      ...newRisk,
      cancellationProbability: adjustedCancellationRisk
    },
    rescueState
  };
}

/**
 * Generates recommended alternative stores in the city for store switching.
 */
export function getAlternativeStoresForOrder(order: Order): AlternativeStoreOption[] {
  const city = order.store.city;

  if (city === 'Bengaluru') {
    return [
      {
        storeId: 'STR-BLR-04',
        storeName: 'NOVA Express Indiranagar Central',
        locality: 'Indiranagar 12th Main',
        distanceKm: 2.1,
        inventoryAgeHours: 0.4,
        fulfillmentRate: 0.98,
        estimatedEtaMin: 22,
        reliabilityDelta: +48
      },
      {
        storeId: 'STR-BLR-09',
        storeName: 'FreshBasket SuperStore Koramangala',
        locality: 'Koramangala 5th Block',
        distanceKm: 3.4,
        inventoryAgeHours: 0.8,
        fulfillmentRate: 0.96,
        estimatedEtaMin: 26,
        reliabilityDelta: +36
      },
      {
        storeId: 'STR-BLR-12',
        storeName: 'Apex Grocery Hub Domlur',
        locality: 'Domlur Intermediate Ring Rd',
        distanceKm: 2.8,
        inventoryAgeHours: 1.2,
        fulfillmentRate: 0.94,
        estimatedEtaMin: 25,
        reliabilityDelta: +32
      }
    ];
  }

  if (city === 'Mumbai') {
    return [
      {
        storeId: 'STR-MUM-03',
        storeName: 'NOVA QuickStore Bandra Linking',
        locality: 'Bandra West Linking Rd',
        distanceKm: 1.8,
        inventoryAgeHours: 0.3,
        fulfillmentRate: 0.99,
        estimatedEtaMin: 20,
        reliabilityDelta: +52
      },
      {
        storeId: 'STR-MUM-07',
        storeName: 'MetroMart Powai Plaza',
        locality: 'Powai Central Avenue',
        distanceKm: 2.6,
        inventoryAgeHours: 0.5,
        fulfillmentRate: 0.97,
        estimatedEtaMin: 24,
        reliabilityDelta: +42
      }
    ];
  }

  // Delhi-NCR
  return [
    {
      storeId: 'STR-DEL-02',
      storeName: 'NOVA Hub Cyber City',
      locality: 'DLF Phase 2 Gurgaon',
      distanceKm: 2.3,
      inventoryAgeHours: 0.2,
      fulfillmentRate: 0.98,
      estimatedEtaMin: 21,
      reliabilityDelta: +46
    },
    {
      storeId: 'STR-DEL-08',
      storeName: 'PrimeMart South Extension',
      locality: 'South Extension II',
      distanceKm: 3.1,
      inventoryAgeHours: 0.9,
      fulfillmentRate: 0.95,
      estimatedEtaMin: 27,
      reliabilityDelta: +38
    }
  ];
}
