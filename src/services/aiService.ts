/**
 * NOVA RESCUE - AI Client Service
 * 
 * SECURITY ARCHITECTURE:
 * Zero-Secret Client: Real credentials NEVER touch the browser.
 * 
 * Browser Client
 *   ↓ POST /api/analyze-order (order telemetry only)
 * Server-Side Endpoint (Node.js Proxy)
 *   ↓ Uses process.env.GEMINI_API_KEY
 * Google Gemini REST API (Server-to-Server)
 *   ↓ Validated structured diagnosis
 * Browser Client receives structured response
 * 
 * If server-side AI is offline or unconfigured, the application
 * automatically uses the deterministic fallback engine.
 */

import { Order, AIAnalysisResult } from '../types';
import { generateFallbackAnalysis, validateAIAnalysisSchema } from './fallbackEngine';

export interface ServerAiStatus {
  configured: boolean;
  model: string;
  mode: 'SERVER_SIDE_GEMINI' | 'DETERMINISTIC_FALLBACK';
}

/**
 * Checks server-side AI configuration without exposing any keys to the client.
 */
export async function checkServerAiStatus(): Promise<ServerAiStatus> {
  try {
    const res = await fetch('/api/status', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        configured: Boolean(data.configured),
        model: data.model || 'gemini-2.5-flash',
        mode: data.configured ? 'SERVER_SIDE_GEMINI' : 'DETERMINISTIC_FALLBACK'
      };
    }
  } catch {
    // If running in an environment without server endpoint, default safely to fallback
  }

  return {
    configured: false,
    model: 'gemini-2.5-flash',
    mode: 'DETERMINISTIC_FALLBACK'
  };
}

/**
 * Analyzes an order via the secure server-side proxy endpoint.
 * Seamlessly falls back to deterministic operations rule engine if server AI is unavailable.
 */
export async function analyzeOrderWithAI(order: Order): Promise<AIAnalysisResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

    const response = await fetch('/api/analyze-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({ order })
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();

      // If server returned successful Gemini analysis
      if (result && !result.fallback && result.data && validateAIAnalysisSchema(result.data)) {
        return {
          ...result.data,
          source: 'AI_GEMINI',
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch {
    // Network failure or server endpoint unreachable
  }

  // Production-safe deterministic fallback
  return generateFallbackAnalysis(order);
}
