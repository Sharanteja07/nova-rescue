/**
 * NOVA RESCUE - AI Reasoning Service
 * Powered by Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
 * with robust, automatic fallback to the deterministic operations reasoning engine.
 */

import { Order, AIAnalysisResult } from '../types';
import { generateFallbackAnalysis, validateAIAnalysisSchema } from './fallbackEngine';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Retrieves the active Gemini API key from environment or user session.
 */
export function getActiveGeminiApiKey(): string | null {
  // Check runtime environment variable (Vite prefix)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() && envKey !== 'your_gemini_api_key_here') {
    return envKey.trim();
  }

  // Check operator session storage
  try {
    const sessionKey = localStorage.getItem('nova_gemini_api_key');
    if (sessionKey && sessionKey.trim()) {
      return sessionKey.trim();
    }
  } catch (e) {
    // LocalStorage unavailable in certain sandboxes
  }

  return null;
}

export function setActiveGeminiApiKey(key: string | null): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem('nova_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('nova_gemini_api_key');
    }
  } catch (e) {
    console.error('Failed to set Gemini API key in storage:', e);
  }
}

/**
 * Analyzes an order using Google Gemini if available, or falls back seamlessly.
 */
export async function analyzeOrderWithAI(order: Order, forceFallback: boolean = false): Promise<AIAnalysisResult> {
  const apiKey = getActiveGeminiApiKey();

  // If force fallback requested or no key provided, use deterministic engine
  if (forceFallback || !apiKey) {
    return generateFallbackAnalysis(order);
  }

  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `${GEMINI_API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

  const prompt = `
You are the operational diagnosis AI for NOVA CART (NOVA RESCUE), a quick-commerce platform across Indian cities.
You must analyze this order's operational telemetry and provide a structured operational diagnosis and practical rescue action.

BUSINESS CONTEXT:
- Cancellation rate increased from 6% to 11% (35% due to product unavailability, 27% due to delivery delay).
- Average delivery time increased from 29 to 37 minutes.
- 39% of partner stores say maintaining online inventory requires too much effort.
- Some partner stores update inventory only once every 1–3 days.
- 29% of customers report products shown as available become unavailable after ordering.
- Customers completing 3 orders have a 72% probability of ordering again the following month.
- Available rescue actions: SWITCH_STORE, SUBSTITUTE_PRODUCT, PROACTIVE_NOTIFY, ADJUST_DELIVERY, PROCEED.

ORDER METRICS TO DIAGNOSE:
${JSON.stringify({
  orderId: order.id,
  orderValueINR: order.orderValue,
  customer: {
    name: order.customer.customerName,
    completedOrders: order.customer.totalCompletedOrders,
    retentionMilestone: order.customer.retentionMilestone,
    pastCancellations: order.customer.pastCancellationsCount
  },
  store: {
    name: order.store.storeName,
    city: order.store.city,
    locality: order.store.locality,
    inventoryAgeHours: order.store.inventoryLastUpdatedHoursAgo,
    fulfillmentRate: order.store.historicalFulfillmentRate,
    rejectionRate: order.store.rejectionRate,
    prepTimeMin: order.store.averagePrepTimeMin,
    partnerStatus: order.store.activePartnerStatus
  },
  delivery: {
    distanceKm: order.delivery.distanceKm,
    riderStatus: order.delivery.assignedRiderStatus,
    traffic: order.delivery.trafficCongestion,
    weather: order.delivery.weatherCondition,
    standardEtaMin: order.delivery.standardEtaMin,
    currentEstimatedEtaMin: order.delivery.currentEstimatedEtaMin,
    etaDelayMin: order.delivery.etaDelayMin
  },
  items: order.items.map(i => ({
    name: i.name,
    status: i.stockStatus,
    confidence: i.availabilityConfidence,
    syncAgeHours: i.inventorySyncAgeHours,
    isHighRisk: i.isHighRiskItem,
    hasSubstitute: !!i.substituteAvailable
  })),
  calculatedRisk: {
    reliabilityScore: order.risk.reliabilityScore,
    riskScore: order.risk.riskScore,
    riskLevel: order.risk.riskLevel,
    cancellationProbability: order.risk.cancellationProbability,
    primaryRisk: order.risk.primaryRisk
  }
}, null, 2)}

OUTPUT REQUIREMENTS:
Respond ONLY with valid JSON conforming to this exact schema (no markdown fences, no explanatory chat):
{
  "risk_summary": "Concise 1-2 sentence operator summary highlighting risk and retention stake",
  "primary_risk": "Short primary failure classification",
  "risk_drivers": ["Specific metric driver 1", "Specific metric driver 2", "Specific metric driver 3"],
  "root_cause": "Detailed operational root cause explaining why this order is failing",
  "recommended_action": "SWITCH_STORE" | "SUBSTITUTE_PRODUCT" | "PROACTIVE_NOTIFY" | "ADJUST_DELIVERY" | "PROCEED",
  "reason": "Why this specific action neutralizes the root cause",
  "expected_effect": "Quantified expected outcome on reliability, ETA, and cancellation probability"
}
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Falling back to deterministic engine.`);
      return generateFallbackAnalysis(order);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return generateFallbackAnalysis(order);
    }

    const parsed = JSON.parse(rawText);

    if (validateAIAnalysisSchema(parsed)) {
      return {
        ...parsed,
        source: 'AI_GEMINI',
        modelUsed: `Google ${model}`,
        timestamp: new Date().toISOString()
      };
    } else {
      console.warn('Gemini response did not match schema. Falling back to deterministic engine.');
      return generateFallbackAnalysis(order);
    }
  } catch (error) {
    console.warn('Gemini API call failed or timed out. Using deterministic fallback engine:', error);
    return generateFallbackAnalysis(order);
  }
}
