import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Enhanced MetaCoin", function () {
  // 测试夹具 - 保持原有设计风格
  async function deployMetaCoinFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    // 部署参数 - 保持原有的默认值
    const tokenName = "LueLueLueERC20Token";
    const tokenSymbol = "Lue";
    const initialSupply = 10000;
    const decimals = 0; // 保持原设计
    const maxSupply = 100000000; // 1亿最大供应量
    
    const MetaCoin = await ethers.getContractFactory("MetaCoin");
    const metaCoin = await MetaCoin.deploy(
      tokenName,
      tokenSymbol,
      initialSupply,
      decimals,
      maxSupply,
      owner.address
    );
    
    return { 
      metaCoin, 
      owner, 
      addr1, 
      addr2, 
      tokenName,
      tokenSymbol,
      initialSupply,
      decimals,
      maxSupply
    };
  }
  
  describe("基础功能测试 (保持原有设计)", function () {
    it("应该正确设置代币基本信息", async function () {
      const { metaCoin, tokenName, tokenSymbol, decimals } = await loadFixture(deployMetaCoinFixture);
      
      expect(await metaCoin.name()).to.equal(tokenName);
      expect(await metaCoin.symbol()).to.equal(tokenSymbol);
      expect(await metaCoin.decimals()).to.equal(decimals);
    });
    
    it("应该正确设置初始供应量", async function () {
      const { metaCoin, owner, initialSupply } = await loadFixture(deployMetaCoinFixture);
      
      expect(await metaCoin.totalSupply()).to.equal(initialSupply);
      expect(await metaCoin.balanceOf(owner.address)).to.equal(initialSupply);
    });
    
    it("应该正确设置最大供应量", async function () {
      const { metaCoin, maxSupply } = await loadFixture(deployMetaCoinFixture);
      
      expect(await metaCoin.MAX_SUPPLY()).to.equal(maxSupply);
    });
    
    it("应该正确设置所有者", async function () {
      const { metaCoin, owner } = await loadFixture(deployMetaCoinFixture);
      
      expect(await metaCoin.owner()).to.equal(owner.address);
      expect(await metaCoin.isMinter(owner.address)).to.be.true;
    });
  });
  
  describe("代币信息查询功能", function () {
    it("getTokenInfo 应该返回正确的信息", async function () {
      const { metaCoin, tokenName, tokenSymbol, initialSupply, maxSupply, decimals } = await loadFixture(deployMetaCoinFixture);
      
      const tokenInfo = await metaCoin.getTokenInfo();
      
      expect(tokenInfo[0]).to.equal(tokenName); // name
      expect(tokenInfo[1]).to.equal(tokenSymbol); // symbol
      expect(tokenInfo[2]).to.equal(initialSupply); // totalSupply
      expect(tokenInfo[3]).to.equal(maxSupply); // maxSupply
      expect(tokenInfo[4]).to.equal(initialSupply); // initialSupply
      expect(tokenInfo[5]).to.equal(decimals); // decimals
    });
    
    it("getStats 应该返回正确的统计信息", async function () {
      const { metaCoin, initialSupply, maxSupply, owner } = await loadFixture(deployMetaCoinFixture);
      
      const stats = await metaCoin.getStats();
      
      expect(stats[0]).to.equal(initialSupply); // currentSupply
      expect(stats[1]).to.equal(maxSupply); // maxSupply
      expect(stats[2]).to.equal(maxSupply - initialSupply); // remainingSupply
      expect(stats[3]).to.equal(false); // isPaused
      expect(stats[4]).to.equal(owner.address); // owner
      expect(stats[5]).to.equal(initialSupply); // holderBalance (msg.sender)
    });
  });
  
  describe("铸币功能测试", function () {
    it("所有者应该能够铸造代币", async function () {
      const { metaCoin, owner, addr1 } = await loadFixture(deployMetaCoinFixture);
      const mintAmount = 1000;
      
      await expect(metaCoin.mint(addr1.address, mintAmount))
        .to.emit(metaCoin, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
        
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(mintAmount);
    });
    
    it("非授权用户不应该能够铸造代币", async function () {
      const { metaCoin, addr1, addr2 } = await loadFixture(deployMetaCoinFixture);
      const mintAmount = 1000;
      
      await expect(metaCoin.connect(addr1).mint(addr2.address, mintAmount))
        .to.be.revertedWith("Not authorized to mint");
    });
    
    it("应该能够添加和移除铸币者", async function () {
      const { metaCoin, owner, addr1 } = await loadFixture(deployMetaCoinFixture);
      
      // 添加铸币者
      await expect(metaCoin.addMinter(addr1.address))
        .to.emit(metaCoin, "MinterAdded")
        .withArgs(addr1.address);
        
      expect(await metaCoin.isMinter(addr1.address)).to.be.true;
      
      // 新铸币者应该能够铸币
      const mintAmount = 500;
      await metaCoin.connect(addr1).mint(addr1.address, mintAmount);
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(mintAmount);
      
      // 移除铸币者
      await expect(metaCoin.removeMinter(addr1.address))
        .to.emit(metaCoin, "MinterRemoved")
        .withArgs(addr1.address);
        
      expect(await metaCoin.isMinter(addr1.address)).to.be.false;
    });
    
    it("不应该允许铸造超过最大供应量", async function () {
      const { metaCoin, owner, maxSupply, initialSupply } = await loadFixture(deployMetaCoinFixture);
      const excessAmount = maxSupply - initialSupply + 1;
      
      await expect(metaCoin.mint(owner.address, excessAmount))
        .to.be.revertedWith("Would exceed max supply");
    });
  });
  
  describe("暂停功能测试", function () {
    it("所有者应该能够暂停和恢复合约", async function () {
      const { metaCoin, owner, addr1 } = await loadFixture(deployMetaCoinFixture);
      
      // 暂停合约
      await metaCoin.pause();
      const stats = await metaCoin.getStats();
      expect(stats[3]).to.be.true; // isPaused
      
      // 暂停状态下不应该能够转账
      await expect(metaCoin.transfer(addr1.address, 100))
        .to.be.revertedWith("EnforcedPause");
      
      // 恢复合约
      await metaCoin.unpause();
      const newStats = await metaCoin.getStats();
      expect(newStats[3]).to.be.false; // isPaused
      
      // 恢复后应该能够正常转账
      await metaCoin.transfer(addr1.address, 100);
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(100);
    });
  });
  
  describe("黑名单功能测试", function () {
    it("应该能够添加和移除黑名单", async function () {
      const { metaCoin, owner, addr1 } = await loadFixture(deployMetaCoinFixture);
      
      // 添加到黑名单
      await expect(metaCoin.addToBlacklist(addr1.address))
        .to.emit(metaCoin, "AddressBlacklisted")
        .withArgs(addr1.address);
        
      expect(await metaCoin.isBlacklisted(addr1.address)).to.be.true;
      
      // 黑名单地址不应该能够接收代币
      await expect(metaCoin.transfer(addr1.address, 100))
        .to.be.revertedWith("Recipient is blacklisted");
      
      // 从黑名单移除
      await expect(metaCoin.removeFromBlacklist(addr1.address))
        .to.emit(metaCoin, "AddressRemovedFromBlacklist")
        .withArgs(addr1.address);
        
      expect(await metaCoin.isBlacklisted(addr1.address)).to.be.false;
      
      // 移除后应该能够正常接收
      await metaCoin.transfer(addr1.address, 100);
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(100);
    });
  });
  
  describe("批量操作功能测试", function () {
    it("应该能够批量转账", async function () {
      const { metaCoin, owner, addr1, addr2 } = await loadFixture(deployMetaCoinFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [100, 200];
      
      await metaCoin.batchTransfer(recipients, amounts);
      
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(100);
      expect(await metaCoin.balanceOf(addr2.address)).to.equal(200);
    });
    
    it("批量转账参数长度不匹配时应该失败", async function () {
      const { metaCoin, addr1, addr2 } = await loadFixture(deployMetaCoinFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [100]; // 长度不匹配
      
      await expect(metaCoin.batchTransfer(recipients, amounts))
        .to.be.revertedWith("Arrays length mismatch");
    });
    
    it("应该能够批量铸币", async function () {
      const { metaCoin, owner, addr1, addr2 } = await loadFixture(deployMetaCoinFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [1000, 2000];
      
      await metaCoin.batchMint(recipients, amounts);
      
      expect(await metaCoin.balanceOf(addr1.address)).to.equal(1000);
      expect(await metaCoin.balanceOf(addr2.address)).to.equal(2000);
    });
  });
  
  describe("代币燃烧功能测试", function () {
    it("应该能够燃烧代币", async function () {
      const { metaCoin, owner, initialSupply } = await loadFixture(deployMetaCoinFixture);
      const burnAmount = 1000;
      const initialBalance = await metaCoin.balanceOf(owner.address);
      const initialTotalSupply = await metaCoin.totalSupply();
      
      await metaCoin.burn(burnAmount);
      
      expect(await metaCoin.balanceOf(owner.address)).to.equal(initialBalance - BigInt(burnAmount));
      expect(await metaCoin.totalSupply()).to.equal(initialTotalSupply - BigInt(burnAmount));
    });
  });
  
  describe("工具函数测试", function () {
    it("应该正确计算剩余可铸造供应量", async function () {
      const { metaCoin, maxSupply, initialSupply } = await loadFixture(deployMetaCoinFixture);
      const remainingSupply = await metaCoin.remainingMintableSupply();
      
      expect(remainingSupply).to.equal(maxSupply - initialSupply);
    });
  });
  
  describe("默认参数构造函数测试", function () {
    it("应该使用默认值当参数为空时", async function () {
      const [owner] = await ethers.getSigners();
      
      const MetaCoin = await ethers.getContractFactory("MetaCoin");
      const metaCoin = await MetaCoin.deploy(
        "", // 空名称，应使用默认值
        "", // 空符号，应使用默认值
        0,  // 0 初始供应量，应使用默认值
        0,  // 使用默认小数位
        0,  // 0 最大供应量，应使用无限制
        owner.address
      );
      
      expect(await metaCoin.name()).to.equal("LueLueLueERC20Token");
      expect(await metaCoin.symbol()).to.equal("Lue");
      expect(await metaCoin.totalSupply()).to.equal(10000);
      expect(await metaCoin.MAX_SUPPLY()).to.equal(2n**256n - 1n); // 最大 uint256
    });
  });
  
  describe("边界条件测试", function () {
    it("不应该允许无效地址操作", async function () {
      const { metaCoin } = await loadFixture(deployMetaCoinFixture);
      
      await expect(metaCoin.addMinter(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid minter address");
        
      await expect(metaCoin.addToBlacklist(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
        
      await expect(metaCoin.mint(ethers.ZeroAddress, 100))
        .to.be.revertedWith("Invalid recipient");
    });
    
    it("不应该重复添加铸币者或黑名单", async function () {
      const { metaCoin, owner, addr1 } = await loadFixture(deployMetaCoinFixture);
      
      // 所有者已经是铸币者
      await expect(metaCoin.addMinter(owner.address))
        .to.be.revertedWith("Already a minter");
      
      // 重复添加黑名单
      await metaCoin.addToBlacklist(addr1.address);
      await expect(metaCoin.addToBlacklist(addr1.address))
        .to.be.revertedWith("Already blacklisted");
    });
  });
});
