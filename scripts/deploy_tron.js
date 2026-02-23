const TronWeb = require('tronweb').TronWeb;
const fs = require('fs');

// Configuration
const PRIVATE_KEY = '3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86';
const TRONGRID_API = 'https://api.trongrid.io';

const tronWeb = new TronWeb({
  fullHost: TRONGRID_API,
  privateKey: PRIVATE_KEY
});

async function deploy() {
  console.log('Starting deployment to TRON mainnet...\n');
  
  // Get compiled contract
  const artifacts = require('../artifacts/contracts/PandaToken.sol/PandaToken.json');
  const bytecode = artifacts.bytecode;
  const abi = artifacts.abi;
  
  console.log('Contract bytecode length:', bytecode.length);
  
  // Deploy contract
  console.log('\nDeploying PandaToken...');
  
  try {
    const contract = await tronWeb.contract().new({
      abi: abi,
      bytecode: bytecode,
      feeLimit: 1000000000,
      callValue: 0,
      userFeePercentage: 30
    });
  
    console.log('\n✅ Deployment successful!');
    console.log('Contract Address (Hex):', contract.address);
    console.log('Contract Address (Base58):', tronWeb.address.fromHex(contract.address));
    
    console.log('\n=== Deployment Complete ===');
    console.log('PandaToken:', tronWeb.address.fromHex(contract.address));
  } catch (e) {
    console.error('Deployment error:', e.message);
  }
}

deploy().catch(console.error);
