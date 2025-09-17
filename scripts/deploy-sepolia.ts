import hre from "hardhat";

async function main() {
  console.log("🌐 Sepolia 测试网 - MetaCoin 部署");
  
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log("   - 网络:", network.name);
  console.log("   - 账户:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   - 余额:", hre.ethers.formatEther(balance), "ETH");

  const deployConfig = {
    tokenName: "LueLueLueERC20Token",
    tokenSymbol: "Lue",
    initialSupply: 10000,
    decimals: 0,
    maxSupply: 100000000,
    initialOwner: deployer.address
  };

  console.log("\n⚙️  代币配置:");
  console.log("   - 名称:", deployConfig.tokenName);
  console.log("   - 符号:", deployConfig.tokenSymbol);
  console.log("   - 初始发行:", deployConfig.initialSupply, deployConfig.tokenSymbol);
  console.log("   - 最大供应:", deployConfig.maxSupply, deployConfig.tokenSymbol);
  console.log("   - 小数位:", deployConfig.decimals);

  try {
    console.log("\n🚀 开始部署 MetaCoin...");
    
    const MetaCoinFactory = await hre.ethers.getContractFactory("MetaCoin");
    const metaCoin = await MetaCoinFactory.deploy(
      deployConfig.tokenName,
      deployConfig.tokenSymbol,
      deployConfig.initialSupply,
      deployConfig.decimals,
      deployConfig.maxSupply,
      deployConfig.initialOwner
    );
    
    await metaCoin.waitForDeployment();
    const contractAddress = await metaCoin.getAddress();
    
    console.log("✅ 部署成功!");
    console.log("📄 合约信息:");
    console.log("   - 合约地址:", contractAddress);
    
    // 验证部署状态
    const tokenInfo = await metaCoin.getTokenInfo();
    console.log("   - 代币名称:", tokenInfo[0]);
    console.log("   - 代币符号:", tokenInfo[1]);
    console.log("   - 当前总量:", tokenInfo[2].toString());
    console.log("   - 最大总量:", tokenInfo[3].toString());
    
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId,
      contractAddress: contractAddress,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      tokenInfo: {
        name: tokenInfo[0],
        symbol: tokenInfo[1],
        totalSupply: tokenInfo[2].toString(),
        maxSupply: tokenInfo[3].toString(),
        decimals: tokenInfo[5]
      }
    };

    console.log("\n📋 部署摘要:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n✅ 验证命令:");
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${deployConfig.tokenName}" "${deployConfig.tokenSymbol}" ${deployConfig.initialSupply} ${deployConfig.decimals} ${deployConfig.maxSupply} "${deployConfig.initialOwner}"`);

    console.log("\n🔗 Etherscan 链接:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);

    return deploymentInfo;

  } catch (error) {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});