/**
 * Veldt Ecommerce — Cloudflare Worker Proxy
 *
 * Bridges the HTTPS GitHub Pages frontend to the plain-HTTP Azure backend.
 *   REST:      https://<worker>/api/*  →  http://veldt-agent-fahad...:8080/api/*
 *   Images:    https://<worker>/images/* → http://veldt-agent-fahad...:8080/images/*
 *   WebSocket: wss://<worker>/ws       →  ws://veldt-agent-fahad...:8080/ws
 */

const BACKEND_HTTP = 'http://veldt-agent-fahad.southeastasia.azurecontainer.io:8080';
const BACKEND_WS   = 'ws://veldt-agent-fahad.southeastasia.azurecontainer.io:8080';

// GitHub Pages origin — update if you use a custom domain
const ALLOWED_ORIGIN = 'https://fahadnoufal.github.io';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age':       '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ── Preflight (CORS) ────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── WebSocket upgrade ───────────────────────────────────────────────────
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      const wsUrl = `${BACKEND_WS}${url.pathname}${url.search}`;
      const [client, server] = Object.values(new WebSocketPair());

      // Connect to the backend WS
      const backendResp = await fetch(wsUrl, {
        headers: { Upgrade: 'websocket' },
      });

      if (backendResp.status !== 101) {
        return new Response('Failed to connect to backend WebSocket', { status: 502 });
      }

      const backendWs = backendResp.webSocket;
      backendWs.accept();
      client.accept();

      // Pipe client → backend
      client.addEventListener('message', (evt) => {
        try { backendWs.send(evt.data); } catch {}
      });
      client.addEventListener('close', (evt) => {
        try { backendWs.close(evt.code, evt.reason); } catch {}
      });

      // Pipe backend → client
      backendWs.addEventListener('message', (evt) => {
        try { client.send(evt.data); } catch {}
      });
      backendWs.addEventListener('close', (evt) => {
        try { client.close(evt.code, evt.reason); } catch {}
      });
      backendWs.addEventListener('error', () => {
        try { client.close(1011, 'backend error'); } catch {}
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // ── Regular HTTP proxy ──────────────────────────────────────────────────
    const targetUrl = `${BACKEND_HTTP}${url.pathname}${url.search}`;

    // Forward the original request but strip the Host header
    const proxyRequest = new Request(targetUrl, {
      method:  request.method,
      headers: filterHeaders(request.headers),
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    let backendResponse;
    try {
      backendResponse = await fetch(proxyRequest);
    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, { status: 502 });
    }

    // Re-emit the response with CORS headers added
    const responseHeaders = new Headers(backendResponse.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(k, v);
    }

    return new Response(backendResponse.body, {
      status:  backendResponse.status,
      headers: responseHeaders,
    });
  },
};

/** Strip hop-by-hop headers that must not be forwarded */
function filterHeaders(headers) {
  const out = new Headers(headers);
  for (const h of ['host', 'cf-connecting-ip', 'cf-ray', 'x-forwarded-for', 'x-real-ip']) {
    out.delete(h);
  }
  return out;
}
