const { TronWeb } = require('tronweb');
const fs = require('fs');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86'
});

const TOKEN_ADDRESS = '41152b5db25141b38f3e05cd594bb78145e998e317';

async function deploy() {
  const account = tronWeb.address.fromPrivateKey('3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86');
  console.log('部署账户:', account);
  
  const balance = await tronWeb.trx.getBalance(account);
  console.log('余额:', balance / 1e6, 'TRX\n');
  
  // 1. Deploy PandaToken
  console.log('=== 1. PandaToken (已部署) ===');
  console.log('地址:', TOKEN_ADDRESS, '\n');
  
  // 2. Deploy PandaExchange
  console.log('=== 2. 部署 PandaExchange ===');
  const exchangeArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaExchange.sol/PandaExchange.json', 'utf8'));
  
  try {
    // For Exchange, we need to pass constructor arguments
    // constructor(address _pandaToken, address _usdtToken)
    // For now, use zero address, will initialize later
    const exchangeContract = await tronWeb.contract().new({
      abi: exchangeArtifact.abi,
      bytecode: exchangeArtifact.bytecode,
      feeLimit: 500000000,
      callValue: 0,
      parameters: [TOKEN_ADDRESS, 'TDPBRADTHB4GP4VHWVDYNAEJXKQM3D3E3E'] // placeholder USDT address
    });
    console.log('✅ PandaExchange 地址:', exchangeContract.address);
  } catch (e) {
    console.log('❌ PandaExchange 错误:', e.message);
  }
  
  // 3. Deploy PandaStaking
  console.log('\n=== 3. 部署 PandaStaking ===');
  const stakingArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/PandaStaking.sol/PandaStaking.json', 'utf8'));
  
  try {
    const stakingContract = await tronWeb.contract().new({
      abi: stakingArtifact.abi,
      bytecode: stakingArtifact.bytecode,
      feeLimit: 500000000,
      callValue: 0,
      parameters: [TOKEN_ADDRESS, TOKEN_ADDRESS]
    });
    console.log('✅ PandaStaking 地址:', stakingContract.address);
  } catch (e) {
    console.log('❌ PandaStaking 错误:', e.message);
  }
}

deploy();
