export async function onRequestPost(context) {
	const { env, request } = context;
	
	try {
	  const { profileData } = await request.json();
	  
	  // Validate profile data exists
	  if (!profileData || !profileData.id || !profileData.name) {
		return new Response(
		  JSON.stringify({ error: 'Invalid profile data' }),
		  { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		  }
		);
	  }
	  
	  // Add lastModified timestamp
	  const profileWithTimestamp = {
		...profileData,
		lastModified: Date.now()
	  };
	  
	  // Generate transfer code
	  const code = generateTransferCode();
	  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
	  
	  // Insert into Supabase using SERVICE_ROLE key (bypasses RLS)
	  const response = await fetch(
		`${env.SUPABASE_URL}/rest/v1/transfer_codes`,
		{
		  method: 'POST',
		  headers: {
			'apikey': env.SUPABASE_SERVICE_KEY,
			'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
			'Content-Type': 'application/json',
			'Prefer': 'return=representation'
		  },
		  body: JSON.stringify({
			code,
			profile_data: profileWithTimestamp,
			expires_at: expiresAt,
			created_by_ip: request.headers.get('CF-Connecting-IP') || 'unknown'
		  })
		}
	  );
	  
	  if (!response.ok) {
		const errorText = await response.text();
		console.error('Supabase error:', errorText);
		throw new Error('Failed to create transfer code');
	  }
	  
	  return new Response(
		JSON.stringify({ code, expiresAt }),
		{ 
		  status: 201,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	  
	} catch (error) {
	  console.error('Create transfer code error:', error);
	  return new Response(
		JSON.stringify({ error: error.message || 'Internal server error' }),
		{ 
		  status: 500,
		  headers: { 'Content-Type': 'application/json' }
		}
	  );
	}
  }
  
  function generateTransferCode() {
	const words = [
	  'TREE', 'FISH', 'MOON', 'STAR', 'BIRD', 'LAKE', 'FIRE', 'SNOW',
	  'RAIN', 'WIND', 'CAVE', 'LEAF', 'WAVE', 'ROCK', 'CORN', 'BEAR',
	  'FROG', 'LION', 'WOLF', 'DEER', 'DUCK', 'HAWK', 'SEAL', 'CRAB'
	];
	
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0,O,1,I,L)
	
	// Shuffle and pick 3 unique words
	const shuffled = [...words].sort(() => Math.random() - 0.5);
	const [word1, word2, word3] = shuffled.slice(0, 3);
	
	// Generate 4 random characters
	const random = Array(4).fill(0)
	  .map(() => chars[Math.floor(Math.random() * chars.length)])
	  .join('');
	
	return `${word1}-${word2}-${word3}-${random}`;
  }