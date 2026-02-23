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
  
  // 1. Deploy PandaToken
  console.log('=== 1. 部署 PandaToken ===');
  const tokenArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaToken.sol/PandaToken.json', 'utf8'));
  
  try {
    const token = await tronWeb.contract().new({
      abi: tokenArtifact.abi,
      bytecode: tokenArtifact.bytecode,
      feeLimit: 1000000000
    });
    console.log('✅ PandaToken:', token.address);
  } catch(e) {
    console.log('❌ PandaToken:', e.message);
    return;
  }
}

deploy();
