const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = 'stock-data.json';

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch(e) {}
  return { portfolio: [], history: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];
  
  // Get portfolio
  if (req.method === 'GET' && url === '/api/portfolio') {
    const data = loadData();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data.portfolio || []));
    return;
  }
  
  // Add portfolio
  if (req.method === 'POST' && url === '/api/portfolio') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const item = JSON.parse(body);
      const data = loadData();
      if (!data.portfolio) data.portfolio = [];
      
      const exists = data.portfolio.find(p => p.code === item.code);
      if (!exists) {
        item.addTime = new Date().toISOString();
        data.portfolio.push(item);
      }
      saveData(data);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  // Delete portfolio
  if (req.method === 'DELETE' && url.startsWith('/api/portfolio/')) {
    const code = url.split('/').pop();
    const data = loadData();
    data.portfolio = data.portfolio.filter(p => p.code !== code);
    saveData(data);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({success: true}));
    return;
  }
  
  // Update portfolio
  if (req.method === 'PUT' && url.startsWith('/api/portfolio/')) {
    const code = url.split('/').pop();
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const updates = JSON.parse(body);
      const data = loadData();
      const idx = data.portfolio.findIndex(p => p.code === code);
      if (idx >= 0) {
        data.portfolio[idx] = {...data.portfolio[idx], ...updates};
        saveData(data);
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Stock API running on port ${PORT}`);
});
