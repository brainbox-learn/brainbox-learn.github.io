export async function onRequest(context) {
	const response = await context.next();
	
	// Add CORS headers
	const corsHeaders = {
	  'Access-Control-Allow-Origin': '*',
	  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	  'Access-Control-Allow-Headers': 'Content-Type',
	};
	
	// Handle preflight requests
	if (context.request.method === 'OPTIONS') {
	  return new Response(null, {
		status: 204,
		headers: corsHeaders
	  });
	}
	
	// Add CORS headers to all responses
	Object.entries(corsHeaders).forEach(([key, value]) => {
	  response.headers.set(key, value);
	});
	
	return response;
  }