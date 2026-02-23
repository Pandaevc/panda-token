const PandaToken = artifacts.require("PandaToken");
const PandaStaking = artifacts.require("PandaStaking");
const PandaExchange = artifacts.require("PandaExchange");

module.exports = async function(deployer) {
  // Deploy PandaToken
  console.log("Deploying PandaToken...");
  await deployer.deploy(PandaToken, 
    "PandaToken",           // name
    "PANDA",                // symbol
    4000000000             // 4 billion supply
  );
  console.log("PandaToken deployed!");

  // Deploy PandaStaking
  console.log("Deploying PandaStaking...");
  await deployer.deploy(PandaStaking);
  console.log("PandaStaking deployed!");

  // Deploy PandaExchange
  console.log("Deploying PandaExchange...");
  await deployer.deploy(PandaExchange);
  console.log("PandaExchange deployed!");
};
