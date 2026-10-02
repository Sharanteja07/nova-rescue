/**
 * NOVA RESCUE - Standalone Production HTTP Server
 * Built with native Node.js (node:http, node:fs, node:path)
 * Zero extra dependencies. Keeps repository size under 1MB.
 * 
 * Provides:
 * 1. GET /api/status -> reports server-side AI connection status without leaking keys
 * 2. POST /api/analyze-order -> proxies order telemetry to Gemini API server-side
 * 3. Serves static production assets from ./dist
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function validateStructuredSchema(data) {
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

async function callGeminiServerSide(order) {
  if (!order || typeof order !== 'object' || !order.id) {
    return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: 'Invalid order telemetry payload provided' };
  }

  if (!API_KEY || !API_KEY.trim() || API_KEY === 'your_gemini_api_key_here') {
    return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: 'GEMINI_API_KEY not configured on server. Operating in deterministic production fallback mode.' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const prompt = `
You are the operational diagnosis AI for NOVA CART (NOVA RESCUE).
Analyze this order and provide structured JSON diagnosis:
${JSON.stringify({
  orderId: order.id,
  orderValueINR: order.orderValue,
  customer: order.customer,
  store: order.store,
  delivery: order.delivery,
  items: order.items,
  risk: order.risk
})}
Respond strictly with valid JSON conforming to:
{
  "risk_summary": "...",
  "primary_risk": "...",
  "risk_drivers": ["..."],
  "root_cause": "...",
  "recommended_action": "SWITCH_STORE" | "SUBSTITUTE_PRODUCT" | "PROACTIVE_NOTIFY" | "ADJUST_DELIVERY" | "PROCEED",
  "reason": "...",
  "expected_effect": "..."
}
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });

    clearTimeout(timeoutId);

    if (!resp.ok) return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: `Gemini API returned status ${resp.status}` };
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: 'Empty response part from Gemini' };

    const parsed = JSON.parse(text);
    if (!validateStructuredSchema(parsed)) {
      return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: 'Response schema mismatch' };
    }

    return {
      fallback: false,
      source: 'AI_GEMINI',
      data: {
        ...parsed,
        source: 'AI_GEMINI',
        modelUsed: `Google ${MODEL} (Server-Side Proxy)`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    return { fallback: true, source: 'DETERMINISTIC_FALLBACK', error: String(err) };
  }
}

const server = http.createServer(async (req, res) => {
  // 1. GET /api/status
  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const isConfigured = Boolean(API_KEY && API_KEY.trim() && API_KEY !== 'your_gemini_api_key_here');
    res.end(JSON.stringify({
      configured: isConfigured,
      model: MODEL,
      mode: isConfigured ? 'SERVER_SIDE_GEMINI' : 'DETERMINISTIC_FALLBACK'
    }));
    return;
  }

  // 2. POST /api/analyze-order
  if (req.method === 'POST' && req.url === '/api/analyze-order') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = await callGeminiServerSide(payload.order);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ fallback: true, error: String(err) }));
      }
    });
    return;
  }

  // 3. Static Files from dist
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`[NOVA RESCUE] Production server running on http://127.0.0.1:${PORT}`);
  console.log(`[NOVA RESCUE] AI Mode: ${API_KEY ? 'Server-Side Gemini Active' : 'Deterministic Fallback Active'}`);
});
