const HDWalletProvider = require('truffle-hdwallet-provider');

const privateKey = '0x3636b3de2a4df33c21c4b85b95ee68f41760f1c5f545db564fc8a6c3b52f2d86';

module.exports = {
  networks: {
    nile: {
      provider: () => new HDWalletProvider(
        privateKey,
        'https://api.nileex.io'
      ),
      network_id: '*',
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    mainnet: {
      provider: () => new HDWalletProvider(
        privateKey,
        'https://api.trongrid.io'
      ),
      network_id: '728126428',
      confirmations: 6,
      timeoutBlocks: 200
    }
  },
  contracts_directory: './tronbox/contracts',
  contracts_build_directory: './tronbox/build',
  migrations_directory: './tronbox/migrations'
};
