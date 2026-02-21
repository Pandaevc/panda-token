const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Simple JSON file database
const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB
function getDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return { users: [], orders: [], products: [], settings: {} };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => res.json({ 
  name: 'PandaToken E-commerce API', 
  version: '2.0.0',
  status: 'running'
}));

// ============ Users ============
app.post('/api/users', (req, res) => {
  const { phone, name, referredBy } = req.body;
  const db = getDB();
  
  // Check exists
  let user = db.users.find(u => u.phone === phone);
  if (user) {
    return res.json({ success: true, user, isNew: false });
  }
  
  user = {
    id: Date.now(),
    phone,
    name: name || phone.substr(-4),
    referralCode: 'PAND' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    referredBy: referredBy || null,
    created: new Date().toISOString()
  };
  
  db.users.push(user);
  saveDB(db);
  
  res.json({ success: true, user, isNew: true });
});

app.get('/api/users/:id', (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ============ Orders ============
app.post('/api/orders', (req, res) => {
  const { userId, userPhone, flavor, amount, tokens, payMethod, txHash, ship } = req.body;
  const db = getDB();
  
  const order = {
    id: 'ORD' + Date.now(),
    userId,
    userPhone,
    flavor,
    amount,
    tokens,
    payMethod,
    txHash,
    ship,
    status: payMethod === 'usdt' ? 'pending_verify' : 'pending_payment',
    referral: null,
    created: new Date().toISOString()
  };
  
  db.orders.push(order);
  saveDB(db);
  
  // Process referral bonus
  if (ship && ship.referredBy) {
    // Add referral logic
  }
  
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  const db = getDB();
  const { userId, status } = req.query;
  let orders = db.orders;
  
  if (userId) orders = orders.filter(o => o.userId == userId);
  if (status) orders = orders.filter(o => o.status === status);
  
  res.json(orders.reverse());
});

app.get('/api/orders/:id', (req, res) => {
  const db = getDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.patch('/api/orders/:id', (req, res) => {
  const db = getDB();
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Order not found' });
  
  db.orders[idx] = { ...db.orders[idx], ...req.body };
  saveDB(db);
  
  res.json({ success: true, order: db.orders[idx] });
});

// ============ Products ============
app.get('/api/products', (req, res) => {
  const db = getDB();
  res.json(db.products.length ? db.products : [
    { id: 1, name: '熊猫智能电子烟 Pro', price: 70, tokens: 3000, flavors: ['原味', '薄荷', '芒果', '葡萄'], stock: 9999 }
  ]);
});

app.post('/api/products', (req, res) => {
  const db = getDB();
  const product = { id: Date.now(), ...req.body, created: new Date().toISOString() };
  db.products.push(product);
  saveDB(db);
  res.json({ success: true, product });
});

app.patch('/api/products/:id', (req, res) => {
  const db = getDB();
 db.products.findIndex(p => p.id  const idx = == req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  saveDB(db);
  res.json({ success: true, product: db.products[idx] });
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDB();
  db.products = db.products.filter(p => p.id != req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// ============ Stats ============
app.get('/api/stats', (req, res) => {
  const db = getDB();
  const orders = db.orders || [];
  
  res.json({
    totalSales: orders.reduce((s, o) => s + (o.amount || 0), 0),
    totalOrders: orders.length,
    totalUsers: db.users.length,
    pendingOrders: orders.filter(o => o.status === 'pending_payment' || o.status === 'pending_verify').length
  });
});

// Start server
module.exports = app;
