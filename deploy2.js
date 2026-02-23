const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDRESS = '41152b5db25141b38f3e05cd594bb78145e998e317';

async function deploy() {
  // Deploy PandaExchange with correct parameters
  console.log('=== 部署 PandaExchange ===');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchange.sol/PandaExchange.json', 'utf8'));
  
  try {
    // Convert addresses to hex
    const tokenHex = tronWeb.address.toHex(TOKEN_ADDRESS);
    // Use a valid USDT address (TRC20)
    const usdtAddr = 'TXkC9jFwvEoD2sR3TJzBxa4bJHH4xd7T8'; // Common USDT placeholder
    
    console.log('Token hex:', tokenHex);
    console.log('USDT address:', usdtAddr);
    
    const exchangeContract = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 1000000000, // 1000 TRX
      callValue: 0
    });
    console.log('✅ PandaExchange 地址:', exchangeContract.address);
  } catch (e) {
    console.log('❌ 错误:', e.message);
  }
}

deploy();
