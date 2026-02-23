const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDR = '41152b5db25141b38f3e05cd594bb78145e998e317';

async function deploy() {
  console.log('部署合约...\n');
  
  // 1. PandaToken (already deployed)
  console.log('✅ PandaToken:', TOKEN_ADDR);
  
  // 2. Deploy PandaExchangeSimple
  console.log('\n部署 PandaExchangeSimple...');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchangeSimple.sol/PandaExchangeSimple.json', 'utf8'));
  
  try {
    const exchange = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 1000000000
    });
    console.log('✅ PandaExchange:', exchange.address);
    
    // 3. Initialize exchange
    console.log('\n初始化 Exchange...');
    await exchange.setTokens(TOKEN_ADDR, TOKEN_ADDR).send();
    console.log('✅ 初始化完成');
    
    console.log('\n========== 部署成功! ==========');
    console.log('PandaToken:', TOKEN_ADDR);
    console.log('PandaExchange:', exchange.address);
    
  } catch (e) {
    console.log('❌ 错误:', e.message);
  }
}

deploy();
