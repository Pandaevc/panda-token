const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDRESS = '41152b5db25141b38f3e05cd594bb78145e998e317';

async function deploy() {
  console.log('=== 部署 PandaExchange ===');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchange.sol/PandaExchange.json', 'utf8'));
  
  try {
    // Pass constructor parameters as array
    const exchangeContract = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 1000000000,
      callValue: 0,
      parameters: [
        [41, 152, 219, 178, 81, 65, 27, 56, 243, 224, 92, 213, 149, 187, 120, 20, 94, 153, 142, 51], // token address as array
        [41, 199, 194, 127, 22, 234, 210, 241, 67, 38, 67, 26, 180, 185, 52, 23, 215, 248] // usdt placeholder
      ]
    });
    console.log('✅ PandaExchange 地址:', exchangeContract.address);
  } catch (e) {
    console.log('❌ 错误:', e.message);
    console.log('尝试不传参数...');
    
    // Try without parameters, we'll set later
    const exchangeContract = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 1000000000,
      callValue: 0
    });
    console.log('✅ PandaExchange (无参数):', exchangeContract.address);
  }
}

deploy();
