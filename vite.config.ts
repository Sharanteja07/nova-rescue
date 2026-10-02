import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { processServerOrderAnalysis } from './server/geminiProxy.ts'

function novaRescueServerPlugin(apiKey: string | undefined, model: string): Plugin {
  return {
    name: 'nova-rescue-server-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Status Check Endpoint (GET /api/status)
        if (req.method === 'GET' && req.url === '/api/status') {
          res.setHeader('Content-Type', 'application/json');
          const isConfigured = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here');
          res.end(JSON.stringify({
            configured: isConfigured,
            model: model || 'gemini-2.5-flash',
            mode: isConfigured ? 'SERVER_SIDE_GEMINI' : 'DETERMINISTIC_FALLBACK',
            endpoint: '/api/analyze-order'
          }));
          return;
        }

        // Order Diagnosis Endpoint (POST /api/analyze-order)
        if (req.method === 'POST' && req.url === '/api/analyze-order') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const order = payload.order;
              const result = await processServerOrderAnalysis(order, apiKey, model);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                fallback: true,
                error: 'Invalid request payload: ' + (err?.message || 'parse error')
              }));
            }
          });
          return;
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'GET' && req.url === '/api/status') {
          res.setHeader('Content-Type', 'application/json');
          const isConfigured = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here');
          res.end(JSON.stringify({
            configured: isConfigured,
            model: model || 'gemini-2.5-flash',
            mode: isConfigured ? 'SERVER_SIDE_GEMINI' : 'DETERMINISTIC_FALLBACK',
            endpoint: '/api/analyze-order'
          }));
          return;
        }

        if (req.method === 'POST' && req.url === '/api/analyze-order') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await processServerOrderAnalysis(payload.order, apiKey, model);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ fallback: true, error: err?.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Read environment variables on Node server side only (not exposed to browser client)
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const model = process.env.GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.5-flash';

  return {
    plugins: [
      react(),
      novaRescueServerPlugin(apiKey, model)
    ],
    server: {
      port: 3000,
      host: '127.0.0.1'
    }
  };
});
