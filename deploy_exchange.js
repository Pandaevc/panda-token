const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDR = '41f76160e4ae37d700f34e13d9c1ef9a0a99aba1f0';

async function deploy() {
  // 2. Deploy PandaExchange
  console.log('=== 2. 部署 PandaExchange ===');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchangeSimple.sol/PandaExchange.json', 'utf8'));
  
  try {
    const exchange = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 1000000000
    });
    console.log('✅ PandaExchange:', exchange.address);
    
    // Initialize
    console.log('\n初始化 Exchange...');
    await exchange.setTokens(TOKEN_ADDR, TOKEN_ADDR).send();
    console.log('✅ 初始化完成');
    
    console.log('\n============= 部署成功! =============');
    console.log('PandaToken:', TOKEN_ADDR);
    console.log('PandaExchange:', exchange.address);
    
  } catch(e) {
    console.log('❌ 错误:', e.message);
  }
}

deploy();
