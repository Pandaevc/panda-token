const express = require('express');
const app = express();
const localtunnel = require('localtunnel');

app.use(express.json());

const orders = new Map();
const referrals = new Map();

app.get('/', (req, res) => res.json({ name: 'PandaToken API', version: '1.0.0' }));

app.post('/api/orders', (req, res) => {
  const { name, phone, country, address, wallet, txHash, referral } = req.body;
  if (!name || !wallet) return res.status(400).json({ error: 'Missing fields' });
  
  const orderId = 'ORD' + Date.now();
  const key = generateKey();
  
  const order = {
    id: orderId, key, referral, referralReward: referral ? 500 : 0,
    wallet, name, country, txHash, status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.set(orderId, order);
  if (referral) referrals.set(referral, (referrals.get(referral) || 0) + 1);
  
  res.json({ success: true, order });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  res.json(order || { error: 'Not found' });
});

app.get('/api/referrals/:code', (req, res) => {
  const count = referrals.get(req.params.code) || 0;
  res.json({ code: req.params.code, count, reward: count * 500 });
});

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array(16).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const server = app.listen(3000, async () => {
  console.log('Server running on port 3000');
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'panda-token-api' });
    console.log('Public URL:', tunnel.url);
    tunnel.on('close', () => process.exit());
  } catch (e) {
    console.log('Tunnel error:', e.message);
  }
});
