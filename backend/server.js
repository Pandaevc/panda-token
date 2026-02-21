const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Database file
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

// ============ API ============
app.get('/', (req, res) => res.json({ name: 'PandaToken API', version: '2.0', status: 'running' }));

// Stats
app.get('/api/stats', (req, res) => {
  const db = getDB();
  const orders = db.orders || [];
  res.json({
    totalSales: orders.reduce((s, o) => s + (o.amount || 0), 0),
    totalOrders: orders.length,
    totalUsers: db.users.length,
    pendingOrders: orders.filter(o => o.status === 'pending_payment').length
  });
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = getDB();
  const { status, userId } = req.query;
  let orders = db.orders || [];
  if (status) orders = orders.filter(o => o.status === status);
  if (userId) orders = orders.filter(o => o.userId == userId);
  res.json(orders.reverse());
});

app.post('/api/orders', (req, res) => {
  const db = getDB();
  const order = {
    id: 'ORD' + Date.now(),
    ...req.body,
    status: 'pending_payment',
    created: new Date().toISOString()
  };
  db.orders = db.orders || [];
  db.orders.push(order);
  saveDB(db);
  res.json({ success: true, order });
});

app.patch('/api/orders/:id', (req, res) => {
  const db = getDB();
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Order not found' });
  db.orders[idx] = { ...db.orders[idx], ...req.body };
  saveDB(db);
  res.json({ success: true, order: db.orders[idx] });
});

// Users
app.get('/api/users', (req, res) => {
  const db = getDB();
  res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
  const db = getDB();
  const { phone, name } = req.body;
  db.users = db.users || [];
  
  let user = db.users.find(u =>);
  if ( u.phone === phoneuser) return res.json({ success: true, user, isNew: false });
  
  user = {
    id: Date.now(),
    phone,
    name:(-4),
    name || phone.substr referralCode: ' Math.random().toPAND' +String(36).substr(2, 6).toUpperCase(),
    created: new Date().toISOString()
  };
  db.users.push(user);
  saveDB(db);
  res.json({ success: true, user true });
});

// Products, isNew:
app.get('/api/products', (req, res) => {
  const db = getDB();
  res.json(db.products.length ? db.products : [
    { id: 1, name: '熊猫智能电子烟 Pro', price: 70, tokens: : '原味3000, flavors,薄荷,芒果,葡萄', stock: 9999, status: 'active' }
  ]);
});

app.post('/api/products', (req, res) => {
  const db = getDB();
  const product = { id: Date.now(), ...req.body, created: new Date().toISOString() };
  db.products = db.products || [];
  db.products.push(product);
  saveDB(db);
  res.json({ success: true, product });
});

app.patch('/api/products/:id', (req, res) => {
  const db = getDB();
  const idx = (db.products || []).findIndex(p => p.id == req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  saveDB(db);
  res.json({ success: true, product: db.products[idx] });
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDB();
  db.products = (db.products || []).filter(p => p.id != req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// USDT Payment Check (调用方轮询检查)
app.get('/api/check-payment', async (req, res) => {
  const { address, amount, orderId } = req.query;
  
  // 这里可以调用TRON API检查转账
  // 演示版返回模拟数据
  res.json({
    received: false,
    txHash: null,
    confirmations: 0
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'admin-token-' + Date.now() });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Settings
app.get('/api/settings', (req, res) => {
  const db = getDB();
  res.json(db.settings || {});
});

app.post('/api/settings', (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true });
});

module.exports = app;

// ============ Stock Portfolio API ============
const STOCK_FILE = path.join(__dirname, 'stock-data.json');

function loadStockData() {
  try {
    if (fs.existsSync(STOCK_FILE)) {
      return JSON.parse(fs.readFileSync(STOCK_FILE, 'utf8'));
    }
  } catch(e) {}
  return { portfolio: [], history: [] };
}

function saveStockData(data) {
  fs.writeFileSync(STOCK_FILE, JSON.stringify(data, null, 2));
}

// Get portfolio
app.get('/api/stock/portfolio', (req, res) => {
  const data = loadStockData();
  res.json(data.portfolio || []);
});

// Add stock
app.post('/api/stock/portfolio', (req, res) => {
  const data = loadStockData();
  const item = req.body;
  const exists = data.portfolio.some(p => p.code === item.code);
  if (!exists) {
    item.addTime = new Date().toISOString();
    data.portfolio.push(item);
    saveStockData(data);
  }
  res.json({ success: true });
});

// Delete stock
app.delete('/api/stock/portfolio/:code', (req, res) => {
  const data = loadStockData();
  data.portfolio = data.portfolio.filter(p => p.code !== req.params.code);
  saveStockData(data);
  res.json({ success: true });
});

// Update stock
app.put('/api/stock/portfolio/:code', (req, res) => {
  const data = loadStockData();
  const idx = data.portfolio.findIndex(p => p.code === req.params.code);
  if (idx >= 0) {
    data.portfolio[idx] = { ...data.portfolio[idx], ...req.body };
    saveStockData(data);
  }
  res.json({ success: true });
});

// Clear all
app.delete('/api/stock/portfolio', (req, res) => {
  saveStockData({ portfolio: [], history: [] });
  res.json({ success: true });
});

console.log('✅ Stock API loaded');
