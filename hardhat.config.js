require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local network
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // TRON Nile testnet (recommended for testing)
    tronTestnet: {
      url: "https://api.nileex.io",
      chainId: 341,
      accounts: []
    },
    // TRON mainnet
    tron: {
      url: "https://api.trongrid.io",
      chainId: 728126428,
      accounts: []
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
