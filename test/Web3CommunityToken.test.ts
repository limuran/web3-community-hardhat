import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "viem";

describe("Web3CommunityToken", function () {
  // 测试夹具
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const initialSupply = parseEther("1000000"); // 100万代币
    
    const Web3CommunityToken = await ethers.getContractFactory("Web3CommunityToken");
    const token = await Web3CommunityToken.deploy(owner.address, initialSupply);
    
    return { token, owner, addr1, addr2, initialSupply };
  }
  
  describe("部署", function () {
    it("应该设置正确的代币名称和符号", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.name()).to.equal("Web3 Community Token");
      expect(await token.symbol()).to.equal("W3CT");
      expect(await token.decimals()).to.equal(18);
    });
    
    it("应该设置正确的初始供应量", async function () {
      const { token, owner, initialSupply } = await loadFixture(deployTokenFixture);
      
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });
    
    it("应该设置正确的所有者", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      expect(await token.owner()).to.equal(owner.address);
      expect(await token.isMinter(owner.address)).to.be.true;
    });
  });
  
  describe("铸币功能", function () {
    it("所有者应该能够铸造代币", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const mintAmount = parseEther("1000");
      
      await expect(token.mint(addr1.address, mintAmount))
        .to.emit(token, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
        
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    });
    
    it("非授权用户不应该能够铸造代币", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const mintAmount = parseEther("1000");
      
      await expect(token.connect(addr1).mint(addr2.address, mintAmount))
        .to.be.revertedWith("Not authorized to mint");
    });
    
    it("应该能够添加和移除铸币者", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // 添加铸币者
      await expect(token.addMinter(addr1.address))
        .to.emit(token, "MinterAdded")
        .withArgs(addr1.address);
        
      expect(await token.isMinter(addr1.address)).to.be.true;
      
      // 新铸币者应该能够铸币
      const mintAmount = parseEther("500");
      await token.connect(addr1).mint(addr1.address, mintAmount);
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
      
      // 移除铸币者
      await expect(token.removeMinter(addr1.address))
        .to.emit(token, "MinterRemoved")
        .withArgs(addr1.address);
        
      expect(await token.isMinter(addr1.address)).to.be.false;
    });
    
    it("不应该允许铸造超过最大供应量", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();
      const currentSupply = await token.totalSupply();
      const excessAmount = maxSupply - currentSupply + parseEther("1");
      
      await expect(token.mint(owner.address, excessAmount))
        .to.be.revertedWith("Would exceed max supply");
    });
  });
  
  describe("暂停功能", function () {
    it("所有者应该能够暂停和恢复合约", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      // 暂停合约
      await token.pause();
      expect(await token.paused()).to.be.true;
      
      // 暂停状态下不应该能够转账
      await expect(token.transfer(addr1.address, parseEther("100")))
        .to.be.revertedWith("EnforcedPause");
      
      // 恢复合约
      await token.unpause();
      expect(await token.paused()).to.be.false;
      
      // 恢复后应该能够正常转账
      await token.transfer(addr1.address, parseEther("100"));
      expect(await token.balanceOf(addr1.address)).to.equal(parseEther("100"));
    });
  });
  
  describe("批量转账", function () {
    it("应该能够批量转账", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [parseEther("100"), parseEther("200")];
      
      await token.batchTransfer(recipients, amounts);
      
      expect(await token.balanceOf(addr1.address)).to.equal(parseEther("100"));
      expect(await token.balanceOf(addr2.address)).to.equal(parseEther("200"));
    });
    
    it("批量转账参数长度不匹配时应该失败", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [parseEther("100")]; // 长度不匹配
      
      await expect(token.batchTransfer(recipients, amounts))
        .to.be.revertedWith("Arrays length mismatch");
    });
  });
  
  describe("代币燃烧", function () {
    it("应该能够燃烧代币", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const burnAmount = parseEther("1000");
      const initialBalance = await token.balanceOf(owner.address);
      const initialSupply = await token.totalSupply();
      
      await token.burn(burnAmount);
      
      expect(await token.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });
  
  describe("工具函数", function () {
    it("应该正确计算剩余可铸造供应量", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();
      const currentSupply = await token.totalSupply();
      const remainingSupply = await token.remainingMintableSupply();
      
      expect(remainingSupply).to.equal(maxSupply - currentSupply);
    });
  });
});
