const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PandaToken Tokenomics", function() {
  let pandaToken;
  let owner, user1, user2;
  
  beforeEach(async function() {
    [owner, user1, user2] = await ethers.getSigners();
    
    const PandaToken = await ethers.getContractFactory("PandaToken");
    pandaToken = await PandaToken.deploy();
    await pandaToken.waitForDeployment();
  });
  
  describe("✅ Supply Tests", function() {
    it("Total supply should be 4 billion", async function() {
      const addr = await pandaToken.getAddress();
      console.log("\n📌 PandaToken Address:", addr);
      
      const TOTAL_SUPPLY = await pandaToken.TOTAL_SUPPLY();
      console.log("📊 Total Supply:", ethers.formatEther(TOTAL_SUPPLY), "PANDA");
      expect(TOTAL_SUPPLY).to.equal(ethers.parseEther("4000000000"));
    });
    
    it("Allocation should be correct", async function() {
      const LIQUIDITY = await pandaToken.LIQUIDITY_POOL();
      const FOUNDATION = await pandaToken.FOUNDATION();
      const MINING = await pandaToken.MINING_REWARD();
      
      console.log("\n💰 代币分配:");
      console.log("   底池:", ethers.formatEther(LIQUIDITY), "PANDA (20%)");
      console.log("   基金会:", ethers.formatEther(FOUNDATION), "PANDA (20%)");
      console.log("   挖矿:", ethers.formatEther(MINING), "PANDA (60%)");
      
      const total = LIQUIDITY + FOUNDATION + MINING;
      expect(total).to.equal(4000000000n * 10n**18n);
    });
  });
  
  describe("✅ Minting Tests", function() {
    it("Should mint tokens correctly", async function() {
      await pandaToken.mint(user1.address, ethers.parseEther("1000000"));
      const balance = await pandaToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("1000000"));
    });
    
    it("Should not exceed total supply", async function() {
      const TOTAL = await pandaToken.TOTAL_SUPPLY();
      await expect(
        pandaToken.mint(user1.address, TOTAL + 1n)
      ).to.be.revertedWith("Exceeds total supply");
    });
  });
  
  describe("✅ Transfer Fee Tests", function() {
    it("Should charge 0.5% fee", async function() {
      await pandaToken.mint(user1.address, ethers.parseEther("1000"));
      
      await pandaToken.connect(user1).transfer(user2.address, ethers.parseEther("1000"));
      
      const user2Balance = await pandaToken.balanceOf(user2.address);
      console.log("\n💸 Transfer Test:");
      console.log("   发送: 1000 PANDA");
      console.log("   实际收到:", ethers.formatEther(user2Balance), "PANDA");
      expect(user2Balance).to.equal(ethers.parseEther("995"));
    });
    
    it("Owner transfers should be fee-free", async function() {
      await pandaToken.mint(owner.address, ethers.parseEther("1000"));
      await pandaToken.transfer(user1.address, ethers.parseEther("1000"));
      
      const balance = await pandaToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("1000"));
    });
  });
});
