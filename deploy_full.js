const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

async function deploy() {
  const account = tronWeb.address.fromPrivateKey('3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86');
  console.log('账户:', account);
  const balance = await tronWeb.trx.getBalance(account);
  console.log('余额:', balance / 1e6, 'TRX\n');
  
  let results = {};
  
  // 1. Deploy PandaToken
  console.log('=== 1. 部署 PandaToken ===');
  const tokenArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaToken.sol/PandaToken.json', 'utf8'));
  try {
    const token = await tronWeb.contract().new({
      abi: tokenArtifact.abi,
      bytecode: tokenArtifact.bytecode,
      feeLimit: 500000000
    });
    results.token = token.address;
    console.log('✅ PandaToken:', token.address);
  } catch(e) {
    console.log('❌ PandaToken:', e.message);
    return;
  }
  
  // 2. Deploy PandaExchange
  console.log('\n=== 2. 部署 PandaExchange ===');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchangeSimple.sol/PandaExchange.json', 'utf8'));
  try {
    const exchange = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 500000000
    });
    results.exchange = exchange.address;
    console.log('✅ PandaExchange:', exchange.address);
    
    // Initialize
    console.log('\n初始化 Exchange...');
    try {
      await exchange.setTokens(results.token, results.token).send();
      console.log('✅ 初始化成功');
    } catch(e) {
      console.log('初始化错误:', e.message);
    }
  } catch(e) {
    console.log('❌ PandaExchange:', e.message);
    return;
  }
  
  console.log('\n========================================');
  console.log('✅ 部署成功!');
  console.log('========================================');
  console.log('PandaToken:', results.token);
  console.log('PandaExchange:', results.exchange);
  console.log('\n查看: https://tronscan.io/#/contract/' + results.token);
}

deploy();
