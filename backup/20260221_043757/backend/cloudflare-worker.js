addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const orders = new Map();
const referrals = new Map();

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  // Routes
  if (path === '/' || path === '') {
    return new Response(JSON.stringify({ name: 'PandaToken API', version: '1.0.0' }), {
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }
  
  if (path === '/api/orders' && request.method === 'POST') {
    const body = await request.json();
    const { name, phone, country, address, wallet, txHash, referral } = body;
    
    if (!name || !wallet) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...headers }
      });
    }
    
    const orderId = 'ORD' + Date.now();
    const key = generateKey();
    
    const order = {
      id: orderId,
      key,
      referral,
      referralReward: referral ? 500 : 0,
      wallet,
      name,
      country,
      txHash,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.set(orderId, order);
    
    if (referral) {
      const refCount = referrals.get(referral) || 0;
      referrals.set(referral, refCount + 1);
    }
    
    return new Response(JSON.stringify({ success: true, order }), {
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }
  
  if (path.startsWith('/api/orders/') && request.method === 'GET') {
    const id = path.split('/').pop();
    const order = orders.get(id);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...headers }
      });
    }
    return new Response(JSON.stringify(order), {
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }
  
  if (path.startsWith('/api/referrals/') && request.method === 'GET') {
    const code = path.split('/').pop();
    const count = referrals.get(code) || 0;
    return new Response(JSON.stringify({ code, count, reward: count * 500 }), {
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404, headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
