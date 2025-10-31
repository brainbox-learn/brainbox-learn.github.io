export async function onRequestPost(context) {
	const { env, request } = context;
	
	try {
	  const { code } = await request.json();
	  
	  // Validate code format
	  if (!code || typeof code !== 'string' || code.length < 10) {
		return new Response(
		  JSON.stringify({ error: 'Invalid code format' }),
		  { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		  }
		);
	  }
	  
	  const cleanCode = code.trim().toUpperCase();
	  
	  // Fetch transfer code from Supabase (using ANON key)
	  const fetchResponse = await fetch(
		`${env.SUPABASE_URL}/rest/v1/transfer_codes?code=eq.${cleanCode}&select=*`,
		{
		  headers: {
			'apikey': env.SUPABASE_ANON_KEY,
			'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
		  }
		}
	  );
	  
	  if (!fetchResponse.ok) {
		throw new Error('Failed to fetch transfer code');
	  }
	  
	  const results = await fetchResponse.json();
	  
	  // Check if code exists
	  if (!results || results.length === 0) {
		return new Response(
		  JSON.stringify({ error: 'Code not found' }),
		  { 
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		  }
		);
	  }
	  
	  const transfer = results[0];
	  
	  // Check if already redeemed
	  if (transfer.redeemed_at) {
		return new Response(
		  JSON.stringify({ error: 'Code already used' }),
		  { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		  }
		);
	  }
	  
	  // Check if expired
	  if (new Date(transfer.expires_at) < new Date()) {
		return new Response(
		  JSON.stringify({ error: 'Code expired' }),
		  { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		  }
		);
	  }
	  
	  // Mark as redeemed (using ANON key)
	  const updateResponse = await fetch(
		`${env.SUPABASE_URL}/rest/v1/transfer_codes?id=eq.${transfer.id}`,
		{
		  method: 'PATCH',
		  headers: {
			'apikey': env.SUPABASE_ANON_KEY,
			'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
			redeemed_at: new Date().toISOString()
		  })
		}
	  );
	  
	  if (!updateResponse.ok) {
		console.error('Failed to mark code as redeemed');
	  }
	  
	  // Return profile data
	  return new Response(
		JSON.stringify({ profileData: transfer.profile_data }),
		{ 
		  status: 200,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	  
	} catch (error) {
	  console.error('Redeem transfer code error:', error);
	  return new Response(
		JSON.stringify({ error: error.message || 'Internal server error' }),
		{ 
		  status: 500,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	}
  }