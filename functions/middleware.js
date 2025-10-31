// functions/middleware.js
export async function onRequest(context) {
	const { request, env } = context;
  
	// ---- CORS (preflight) ----
	const corsHeaders = {
	  'Access-Control-Allow-Origin': '*',
	  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	  'Access-Control-Allow-Headers': 'Content-Type',
	};
	if (request.method === 'OPTIONS') {
	  return new Response(null, { status: 204, headers: corsHeaders });
	}
  
	// ---- Rate limit (KV: RATE_LIMIT) ----
	// Window: 60s, Max: 20 requests per (IP + method + path)
	const WINDOW_SEC = 60;
	const MAX_REQ = 20;
  
	const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
	const url = new URL(request.url);
	const bucketKey = `rl:${ip}:${request.method}:${url.pathname}:${Math.floor(Date.now() / (WINDOW_SEC * 1000))}`;
  
	// Read current count (defaults to 0)
	const current = Number((await env.RATE_LIMIT.get(bucketKey)) || '0');
  
	if (current >= MAX_REQ) {
	  const retryAfter = WINDOW_SEC; // simple: end of current window
	  return new Response(
		JSON.stringify({ error: 'rate_limited', retryAfterSeconds: retryAfter }),
		{
		  status: 429,
		  headers: {
			...corsHeaders,
			'Content-Type': 'application/json',
			'Retry-After': String(retryAfter),
			'X-RateLimit-Limit': String(MAX_REQ),
			'X-RateLimit-Remaining': '0',
			'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
		  },
		}
	  );
	}
  
	// Increment (not atomic—good enough for lightweight APIs); TTL expires with window
	await env.RATE_LIMIT.put(bucketKey, String(current + 1), { expirationTtl: WINDOW_SEC + 5 });
  
	// ---- Continue to route handler ----
	const response = await context.next();
  
	// CORS + informational headers on success
	response.headers.set('Access-Control-Allow-Origin', '*');
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
	response.headers.set('X-RateLimit-Limit', String(MAX_REQ));
	response.headers.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQ - current - 1)));
	// Approximate reset time (end of window)
	const resetEpoch = Math.ceil(Date.now() / (WINDOW_SEC * 1000)) * WINDOW_SEC;
	response.headers.set('X-RateLimit-Reset', String(resetEpoch));
  
	return response;
  }