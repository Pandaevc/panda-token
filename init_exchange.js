const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDR = '41f76160e4ae37d700f34e13d9c1ef9a0a99aba1f0';
const EXCHANGE_ADDR = '418b52ff07f595c1ad0d746b8f734c27016c4f1d3e';

async function init() {
  console.log('初始化 Exchange...');
  console.log('Token:', TOKEN_ADDR);
  console.log('Exchange:', EXCHANGE_ADDR);
  
  try {
    // Load contract
    const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchangeSimple.sol/PandaExchange.json', 'utf8'));
    const contract = await tronWeb.contract(artifact.abi, EXCHANGE_ADDR);
    
    // Call setTokens
    const result = await contract.setTokens(TOKEN_ADDR, TOKEN_ADDR).send();
    console.log('✅ 初始化成功!');
    console.log('Tx:', result);
    
  } catch(e) {
    console.log('❌ 错误:', e.message);
  }
}

init();
