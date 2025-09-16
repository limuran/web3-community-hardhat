import { ethers } from "hardhat";

async function main() {
  console.log("🌐 Sepolia 测试网 - MetaCoin 增强版部署");
  console.log("=" .repeat(50));
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log("   - 网络:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("   - 部署账户:", deployer.address);
  
  // 检查账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   - 账户余额:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  警告: 账户余额较低，可能不足以支付部署费用");
    console.log("   建议获取更多测试 ETH: https://sepoliafaucet.com/");
  }
  
  // MetaCoin 部署参数配置（保持你的原始设计风格）
  const deployConfig = {
    tokenName: "LueLueLueERC20Token", // 保持原名称
    tokenSymbol: "Lue", // 保持原符号  
    initialSupply: 10000, // 保持原发行量
    decimals: 0, // 保持原精度设计
    maxSupply: 100000000, // 设置最大供应量（1亿，原来的10000倍）
    initialOwner: deployer.address
  };
  
  console.log("\\n⚙️  代币配置 (基于你的原始 MetaCoin 设计):");
  console.log("   - 代币名称:", deployConfig.tokenName);
  console.log("   - 代币符号:", deployConfig.tokenSymbol);
  console.log("   - 初始发行量:", deployConfig.initialSupply, deployConfig.tokenSymbol);
  console.log("   - 最大供应量:", deployConfig.maxSupply, deployConfig.tokenSymbol);
  console.log("   - 小数位数:", deployConfig.decimals, "(保持原设计)");
  console.log("   - 初始所有者:", deployConfig.initialOwner);
  
  console.log("\\n🚀 开始部署增强版 MetaCoin...");
  
  try {
    // 部署合约
    const MetaCoinFactory = await ethers.getContractFactory("MetaCoin");
    
    console.log("   正在部署 MetaCoin 合约到 Sepolia...");
    const metaCoin = await MetaCoinFactory.deploy(
      deployConfig.tokenName,
      deployConfig.tokenSymbol,
      deployConfig.initialSupply,
      deployConfig.decimals,
      deployConfig.maxSupply,
      deployConfig.initialOwner
    );
    
    console.log("   等待交易确认...");
    await metaCoin.waitForDeployment();
    
    const contractAddress = await metaCoin.getAddress();
    const deployTx = metaCoin.deploymentTransaction();
    
    console.log("\\n✅ 部署成功!");
    console.log("=" .repeat(50));
    console.log("📄 合约信息:");
    console.log("   - 合约地址:", contractAddress);
    console.log("   - 交易哈希:", deployTx?.hash);
    console.log("   - Gas 使用量:", deployTx?.gasLimit?.toString());
    
    // 验证合约状态
    console.log("\\n🔍 验证合约状态...");
    const tokenInfo = await metaCoin.getTokenInfo();
    const stats = await metaCoin.getStats();
    const owner = await metaCoin.owner();
    const isMinter = await metaCoin.isMinter(deployer.address);
    
    console.log("\\n📊 代币详细信息:");
    console.log("   - 名称:", tokenInfo[0]);
    console.log("   - 符号:", tokenInfo[1]);
    console.log("   - 当前总量:", tokenInfo[2].toString(), tokenInfo[1]);
    console.log("   - 最大供应量:", tokenInfo[3].toString(), tokenInfo[1]);
    console.log("   - 初始发行量:", tokenInfo[4].toString(), tokenInfo[1]);
    console.log("   - 小数位数:", tokenInfo[5]);
    console.log("   - 合约所有者:", owner);
    console.log("   - 部署者是否为铸币者:", isMinter);
    console.log("   - 合约是否暂停:", stats[3]);
    console.log("   - 剩余可铸造量:", (stats[4] === 2n**256n - 1n) ? "无限制" : stats[4].toString());
    
    // 显示新增功能
    console.log("\\n🆕 新增功能特性:");
    console.log("   ✅ 铸币功能 (仅授权用户)");
    console.log("   ✅ 燃烧功能 (任何持有者)");
    console.log("   ✅ 暂停功能 (紧急情况)"); 
    console.log("   ✅ 黑名单管理 (安全控制)");
    console.log("   ✅ 批量转账/铸币 (效率提升)");
    console.log("   ✅ 最大供应量限制 (经济控制)");
    console.log("   ✅ 详细统计信息 (数据查看)");
    
    // 生成后续操作指南
    console.log("\\n📋 后续操作指南:");
    console.log("=" .repeat(50));
    console.log("\\n1. 📱 添加代币到 MetaMask:");
    console.log("   - 代币地址:", contractAddress);
    console.log("   - 代币符号:", deployConfig.tokenSymbol);
    console.log("   - 小数位数:", deployConfig.decimals);
    
    console.log("\\n2. 🔍 在 Etherscan 上查看:");
    console.log("   https://sepolia.etherscan.io/address/" + contractAddress);
    
    console.log("\\n3. ✅ 验证合约源码:");
    const verifyCommand = `npx hardhat verify --network sepolia ${contractAddress} "${deployConfig.tokenName}" "${deployConfig.tokenSymbol}" ${deployConfig.initialSupply} ${deployConfig.decimals} ${deployConfig.maxSupply} "${deployConfig.initialOwner}"`;
    console.log("   " + verifyCommand);
    
    console.log("\\n4. 🧪 测试合约功能:");
    console.log("   npx hardhat console --network sepolia");
    console.log("   // 然后在控制台中:");
    console.log(`   const token = await ethers.getContractAt("MetaCoin", "${contractAddress}");`);
    console.log("   await token.getTokenInfo(); // 查看代币信息");
    console.log("   await token.getStats(); // 查看统计数据");
    
    console.log("\\n5. 💡 高级功能测试:");
    console.log("   // 铸造新代币 (仅限铸币者)");
    console.log("   await token.mint(recipientAddress, amount);");
    console.log("   // 批量转账");
    console.log("   await token.batchTransfer([addr1, addr2], [amount1, amount2]);");
    console.log("   // 燃烧代币");
    console.log("   await token.burn(amount);");
    
    console.log("\\n6. 💰 获取测试 ETH:");
    console.log("   https://sepoliafaucet.com/");
    console.log("   https://faucet.sepolia.dev/");
    
    // 保存部署信息到文件
    const deploymentInfo = {
      network: "sepolia",
      chainId: network.chainId,
      contractAddress: contractAddress,
      deployerAddress: deployer.address,
      transactionHash: deployTx?.hash,
      blockNumber: await ethers.provider.getBlockNumber(),
      deployedAt: new Date().toISOString(),
      gasUsed: deployTx?.gasLimit?.toString(),
      contractDetails: {
        name: tokenInfo[0],
        symbol: tokenInfo[1],
        currentSupply: tokenInfo[2].toString(),
        maxSupply: tokenInfo[3].toString(),
        initialSupply: tokenInfo[4].toString(),
        decimals: tokenInfo[5].toString(),
        owner: owner,
        isMinter: isMinter
      },
      deployConfig: deployConfig
    };
    
    console.log("\\n💾 部署信息已保存:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\\n🎉 增强版 MetaCoin 在 Sepolia 测试网部署完成!");
    console.log("🔥 保持了你的原始设计风格，同时添加了强大的新功能！");
    console.log("=" .repeat(50));
    
    return {
      contractAddress,
      deploymentInfo
    };
    
  } catch (error) {
    console.error("\\n❌ 部署失败:");
    console.error(error);
    
    if (error.message?.includes("insufficient funds")) {
      console.log("\\n💡 解决方案:");
      console.log("1. 获取测试 ETH: https://sepoliafaucet.com/");
      console.log("2. 确保账户有至少 0.01 ETH 用于部署");
    }
    
    process.exit(1);
  }
}

// 运行部署脚本
main()
  .then((result) => {
    console.log("\\n🏁 MetaCoin 增强版部署脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\\n💥 脚本执行失败:", error);
    process.exit(1);
  });
