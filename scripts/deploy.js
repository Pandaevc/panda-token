// Deploy script for all contracts

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy PandaToken
  console.log("\n1. Deploying PandaToken...");
  const PandaToken = await ethers.getContractFactory("PandaToken");
  const pandaToken = await PandaToken.deploy();
  await pandaToken.deployed();
  console.log("PandaToken deployed to:", pandaToken.address);

  // Deploy mock USDT (for testing)
  console.log("\n2. Deploying Mock USDT...");
  const MockUSDT = await ethers.getContractFactory("ERC20Mock");
  const usdtToken = await MockUSDT.deploy("USDT", "USDT");
  await usdtToken.deployed();
  console.log("Mock USDT deployed to:", usdtToken.address);

  // Mint some USDT to the exchange for liquidity
  console.log("\n3. Minting USDT for liquidity...");
  await usdtToken.mint(deployer.address, ethers.utils.parseUnits("1000000", 18)); // 1M USDT
  
  // Deploy PandaStaking
  console.log("\n4. Deploying PandaStaking...");
  const PandaStaking = await ethers.getContractFactory("PandaStaking");
  const pandaStaking = await PandaStaking.deploy(pandaToken.address, pandaToken.address);
  await pandaStaking.deployed();
  console.log("PandaStaking deployed to:", pandaStaking.address);

  // Deploy PandaExchange
  console.log("\n5. Deploying PandaExchange...");
  const PandaExchange = await ethers.getContractFactory("PandaExchange");
  const pandaExchange = await PandaExchange.deploy(pandaToken.address, usdtToken.address);
  await pandaExchange.deployed();
  console.log("PandaExchange deployed to:", pandaExchange.address);

  // Transfer tokens to exchange for liquidity
  console.log("\n6. Setting up liquidity...");
  const tokenAmount = ethers.utils.parseUnits("2000000000", 18); // 2B tokens
  await pandaToken.transfer(pandaExchange.address, tokenAmount);
  console.log("Transferred tokens to exchange for liquidity");

  console.log("\n=== Deployment Complete ===");
  console.log("PandaToken:", pandaToken.address);
  console.log("USDT:", usdtToken.address);
  console.log("PandaStaking:", pandaStaking.address);
  console.log("PandaExchange:", pandaExchange.address);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Add PANDA token to MetaMask/TP Wallet");
  console.log("2. Set key values using setKeyValue()");
  console.log("3. Users can now redeem keys for tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
