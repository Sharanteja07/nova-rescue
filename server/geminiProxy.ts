/**
 * NOVA RESCUE - Server-Side Gemini AI Proxy
 * 
 * SECURITY ARCHITECTURE:
 * This module runs STRICTLY on the Node.js server.
 * Real Gemini API credentials are read from process.env.GEMINI_API_KEY on the server.
 * Credentials are NEVER transmitted to or accessible by the browser client.
 * 
 * Flow:
 * Client (Browser)
 *   ↓ POST /api/analyze-order (order telemetry payload only)
 * Server Middleware (Node.js)
 *   ↓ Uses process.env.GEMINI_API_KEY
 * Google Gemini REST API (Server-to-Server)
 *   ↓ Validates structured JSON schema
 * Client (Browser) receives validated structured diagnosis
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface ServerAnalyzeResult {
  fallback: boolean;
  data?: any;
  error?: string;
  source?: 'AI_GEMINI' | 'DETERMINISTIC_FALLBACK';
}

export function validateStructuredSchema(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.risk_summary !== 'string' || !data.risk_summary.trim()) return false;
  if (typeof data.primary_risk !== 'string' || !data.primary_risk.trim()) return false;
  if (!Array.isArray(data.risk_drivers) || data.risk_drivers.length === 0) return false;
  if (typeof data.root_cause !== 'string' || !data.root_cause.trim()) return false;
  if (typeof data.recommended_action !== 'string') return false;
  if (typeof data.reason !== 'string' || !data.reason.trim()) return false;
  if (typeof data.expected_effect !== 'string' || !data.expected_effect.trim()) return false;

  const validActions = [
    'SWITCH_STORE',
    'SUBSTITUTE_PRODUCT',
    'PROACTIVE_NOTIFY',
    'ADJUST_DELIVERY',
    'PROCEED'
  ];
  return validActions.includes(data.recommended_action);
}

export async function processServerOrderAnalysis(
  order: any,
  apiKey: string | undefined,
  modelName: string = 'gemini-1.5-flash'
): Promise<ServerAnalyzeResult> {
  // If no server-side key is provided, indicate fallback immediately
  if (!apiKey || !apiKey.trim() || apiKey === 'your_gemini_api_key_here') {
    return {
      fallback: true,
      source: 'DETERMINISTIC_FALLBACK',
      error: 'GEMINI_API_KEY not configured on server. Operating in deterministic production fallback mode.'
    };
  }

  const model = modelName.trim() || 'gemini-1.5-flash';
  const url = `${GEMINI_API_ENDPOINT}/${model}:generateContent?key=${apiKey.trim()}`;

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
    name: order.customer?.customerName,
    completedOrders: order.customer?.totalCompletedOrders,
    retentionMilestone: order.customer?.retentionMilestone,
    pastCancellations: order.customer?.pastCancellationsCount
  },
  store: {
    name: order.store?.storeName,
    city: order.store?.city,
    locality: order.store?.locality,
    inventoryAgeHours: order.store?.inventoryLastUpdatedHoursAgo,
    fulfillmentRate: order.store?.historicalFulfillmentRate,
    rejectionRate: order.store?.rejectionRate,
    prepTimeMin: order.store?.averagePrepTimeMin,
    partnerStatus: order.store?.activePartnerStatus
  },
  delivery: {
    distanceKm: order.delivery?.distanceKm,
    riderStatus: order.delivery?.assignedRiderStatus,
    traffic: order.delivery?.trafficCongestion,
    weather: order.delivery?.weatherCondition,
    standardEtaMin: order.delivery?.standardEtaMin,
    currentEstimatedEtaMin: order.delivery?.currentEstimatedEtaMin,
    etaDelayMin: order.delivery?.etaDelayMin
  },
  items: order.items?.map((i: any) => ({
    name: i.name,
    status: i.stockStatus,
    confidence: i.availabilityConfidence,
    syncAgeHours: i.inventorySyncAgeHours,
    isHighRisk: i.isHighRiskItem,
    hasSubstitute: !!i.substituteAvailable
  })),
  calculatedRisk: {
    reliabilityScore: order.risk?.reliabilityScore,
    riskScore: order.risk?.riskScore,
    riskLevel: order.risk?.riskLevel,
    cancellationProbability: order.risk?.cancellationProbability,
    primaryRisk: order.risk?.primaryRisk
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
    const timeoutId = setTimeout(() => controller.abort(), 9000);

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
      console.warn(`[Server Gemini Proxy] Upstream API returned HTTP ${response.status}. Falling back to deterministic engine.`);
      return {
        fallback: true,
        source: 'DETERMINISTIC_FALLBACK',
        error: `Gemini API returned status ${response.status}`
      };
    }

    const data: any = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        fallback: true,
        source: 'DETERMINISTIC_FALLBACK',
        error: 'Empty response part from Gemini'
      };
    }

    const parsed = JSON.parse(rawText);

    if (validateStructuredSchema(parsed)) {
      return {
        fallback: false,
        source: 'AI_GEMINI',
        data: {
          ...parsed,
          source: 'AI_GEMINI',
          modelUsed: `Google ${model} (Server-Side Proxy)`,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      console.warn('[Server Gemini Proxy] Response did not conform to schema. Falling back to deterministic engine.');
      return {
        fallback: true,
        source: 'DETERMINISTIC_FALLBACK',
        error: 'Response schema mismatch'
      };
    }
  } catch (error: any) {
    console.warn('[Server Gemini Proxy] Upstream call failed or timed out:', error?.message || error);
    return {
      fallback: true,
      source: 'DETERMINISTIC_FALLBACK',
      error: error?.message || 'Upstream request failed'
    };
  }
}
