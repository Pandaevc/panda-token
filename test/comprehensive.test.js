const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PandaTokenV2 Tests", function() {
  let token, owner, user1, user2;
  
  beforeEach(async function() {
    [owner, user1, user2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("PandaTokenV2");
    token = await Token.deploy();
    await token.waitForDeployment();
  });
  
  it("Should have correct total supply", async function() {
    const addr = await token.getAddress();
    console.log("Token Address:", addr);
    const total = await token.TOTAL_SUPPLY();
    console.log("Total Supply:", ethers.formatEther(total), "PANDA");
    expect(total).to.equal(6_000_000_000n * 10n**18n);
  });
  
  it("Should charge 0.5% transfer fee with 50% burn", async function() {
    // Mint to user1
    await token.mint(user1.address, ethers.parseEther("1000"));
    
    // Transfer
    await token.connect(user1).transfer(user2.address, ethers.parseEther("1000"));
    
    const user2Balance = await token.balanceOf(user2.address);
    console.log("Received:", ethers.formatEther(user2Balance));
    
    // Should receive 995 (0.5% fee = 5, half burned = 2.5)
    expect(user2Balance).to.be.closeTo(ethers.parseEther("995"), ethers.parseEther("0.01"));
  });
  
  it("Should update price based on burns", async function() {
    await token.mint(user1.address, ethers.parseEther("1000000"));
    await token.connect(user1).transfer(user2.address, ethers.parseEther("1000000"));
    
    const price = await token.getCurrentPrice();
    console.log("Price after burn:", ethers.formatEther(price), "ETH");
  });
});

describe("PandaExchangeV2 Tests", function() {
  let exchange, pandaToken, usdtToken, owner, user1;
  
  beforeEach(async function() {
    [owner, user1] = await ethers.getSigners();
    
    // Deploy tokens
    const PandaToken = await ethers.getContractFactory("PandaTokenV2");
    pandaToken = await PandaToken.deploy();
    await pandaToken.waitForDeployment();
    
    const USDT = await ethers.getContractFactory("ERC20Mock");
    usdtToken = await USDT.deploy("USDT", "USDT");
    await usdtToken.waitForDeployment();
    
    // Deploy exchange
    const Exchange = await ethers.getContractFactory("PandaExchangeV2");
    exchange = await Exchange.deploy(
      await pandaToken.getAddress(),
      await usdtToken.getAddress()
    );
    await exchange.waitForDeployment();
  });
  
  it("Should initialize pool correctly", async function() {
    const pandaAmount = ethers.parseEther("1000000000"); // 10亿
    const usdtAmount = ethers.parseEther("10000"); // 1万
    
    await pandaToken.mint(owner.address, pandaAmount);
    await usdtToken.mint(owner.address, usdtAmount);
    
    await pandaToken.approve(await exchange.getAddress(), pandaAmount);
    await usdtToken.approve(await exchange.getAddress(), usdtAmount);
    
    await exchange.initPool(pandaAmount, usdtAmount);
    
    const reserves = await exchange.getReserves();
    console.log("Panda Reserve:", ethers.formatEther(reserves[0]));
    console.log("USDT Reserve:", ethers.formatEther(reserves[1]));
    
    const price = await exchange.getCurrentPrice();
    console.log("Initial Price:", ethers.formatEther(price));
  });
});

console.log("\n=== Running Comprehensive Tests ===");
