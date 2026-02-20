const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage (for demo)
const orders = new Map();
const referrals = new Map();

// Root
app.get('/', (req, res) => res.json({ 
  name: 'PandaToken API', 
  version: '1.0.0',
  status: 'running'
}));

// Create order
app.post('/api/orders', (req, res) => {
  const { name, phone, country, address, wallet, txHash, referral } = req.body;
  
  if (!name || !wallet) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const orderId = 'ORD' + Date.now();
  const key = generateKey();
  const referralReward = referral ? 500 : 0;
  
  const order = {
    id: orderId,
    key,
    referral,
    referralReward,
    wallet,
    name,
    country,
    txHash,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.set(orderId, order);
  
  // Record referral
  if (referral) {
    const refCount = referrals.get(referral) || 0;
    referrals.set(referral, refCount + 1);
  }
  
  res.json({ success: true, order });
});

// Get order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Get referral stats
app.get('/api/referrals/:code', (req, res) => {
  const count = referrals.get(req.params.code) || 0;
  const reward = count * 500;
  res.json({ code: req.params.code, count, reward });
});

// Verify payment (placeholder)
app.post('/api/verify', (req, res) => {
  const { txHash } = req.body;
  res.json({ success: true, confirmed: false, message: 'Manual verification required' });
});

// Export for Vercel
module.exports = app;

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Start server (for local)
if (require.main === module) {
  app.listen(PORT, () => console.log(`PandaToken API running on port ${PORT}`));
}
