const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDR = '41f76160e4ae37d700f34e13d9c1ef9a0a99aba1f0';

async function deploy() {
  console.log('部署 PandaExchange...\n');
  
  const artifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchangeSimple.sol/PandaExchange.json', 'utf8'));
  
  console.log('ABI functions:', artifact.abi.filter(f => f.type === 'function').length);
  
  try {
    const contract = await tronWeb.contract().new({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      feeLimit: 2000000000,  // 2000 TRX
      callValue: 0
    });
    
    console.log('✅ 部署成功!');
    console.log('地址:', contract.address);
    
    // Try to set tokens
    console.log('\n设置Token地址...');
    
  } catch(e) {
    console.log('❌ 错误:', e.message);
    console.log('\n详细信息:', e);
  }
}

deploy();
