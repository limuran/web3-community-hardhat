import { ethers } from "hardhat";

async function main() {
  console.log("🎓 Web3大学完整系统部署");
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log("   - 网络:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("   - 部署账户:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   - 账户余额:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.05")) {
    console.log("⚠️  警告: 余额可能不足以部署所有合约");
  }
  
  console.log("\n🚀 开始部署合约...");
  
  try {
    // 部署配置
    const config = {
      tokenName: "YDToken",
      tokenSymbol: "YD", 
      initialSupply: 10000,
      decimals: 0,
      maxSupply: 1000000000, // 10亿代币
      initialOwner: deployer.address
    };
    
    console.log("\n⚙️  代币配置:");
    console.log("   - 名称:", config.tokenName);
    console.log("   - 符号:", config.tokenSymbol);
    console.log("   - 初始发行:", config.initialSupply, config.tokenSymbol);
    console.log("   - 最大供应:", config.maxSupply, config.tokenSymbol);
    console.log("   - 小数位:", config.decimals);
    
    // 1. 部署YD代币合约 (MetaCoin增强版)
    console.log("\n📄 1/4 部署YD代币合约...");
    const YDTokenFactory = await ethers.getContractFactory("MetaCoin");
    const ydToken = await YDTokenFactory.deploy(
      config.tokenName,
      config.tokenSymbol,
      config.initialSupply,
      config.decimals,
      config.maxSupply,
      config.initialOwner
    );
    await ydToken.waitForDeployment();
    const ydTokenAddress = await ydToken.getAddress();
    console.log("   ✅ YD代币合约:", ydTokenAddress);
    
    // 2. 部署课程合约
    console.log("\n📚 2/4 部署课程合约...");
    const CourseContractFactory = await ethers.getContractFactory("CourseContract");
    const courseContract = await CourseContractFactory.deploy(
      ydTokenAddress,
      config.initialOwner
    );
    await courseContract.waitForDeployment();
    const courseContractAddress = await courseContract.getAddress();
    console.log("   ✅ 课程合约:", courseContractAddress);
    
    // 3. 部署兑换合约 (暂时用零地址作为USDT，后续可更新)
    console.log("\n💱 3/4 部署兑换合约...");
    const ExchangeContractFactory = await ethers.getContractFactory("ExchangeContract");
    const exchangeContract = await ExchangeContractFactory.deploy(
      ydTokenAddress,
      "0x0000000000000000000000000000000000000000", // 暂时用零地址，后续可更新
      config.initialOwner
    );
    await exchangeContract.waitForDeployment();
    const exchangeContractAddress = await exchangeContract.getAddress();
    console.log("   ✅ 兑换合约:", exchangeContractAddress);
    
    // 4. 部署NFT证书合约
    console.log("\n🏆 4/4 部署NFT证书合约...");
    const CourseNFTFactory = await ethers.getContractFactory("CourseNFT");
    const courseNFT = await CourseNFTFactory.deploy(
      courseContractAddress,
      config.initialOwner
    );
    await courseNFT.waitForDeployment();
    const courseNFTAddress = await courseNFT.getAddress();
    console.log("   ✅ NFT证书合约:", courseNFTAddress);
    
    console.log("\n🔧 配置合约关联...");
    
    // 给兑换合约添加YD代币流动性 (将一部分代币转给兑换合约)
    const liquidityAmount = config.initialSupply / 10; // 10%用作流动性
    console.log(`   - 向兑换合约提供流动性: ${liquidityAmount} YD`);
    const transferTx = await ydToken.transfer(exchangeContractAddress, liquidityAmount);
    await transferTx.wait();
    
    // 验证合约状态
    console.log("\n🔍 验证合约状态...");
    
    // YD代币状态
    const tokenInfo = await ydToken.getTokenInfo();
    console.log("📊 YD代币状态:");
    console.log("   - 当前总量:", tokenInfo[2].toString(), tokenInfo[1]);
    console.log("   - 最大供应:", tokenInfo[3].toString(), tokenInfo[1]);
    console.log("   - 部署者余额:", (config.initialSupply - liquidityAmount), tokenInfo[1]);
    console.log("   - 兑换合约余额:", liquidityAmount, tokenInfo[1]);
    
    // 课程合约状态
    const [platformRevenue, feePercentage] = await courseContract.getPlatformStats();
    console.log("📚 课程合约状态:");
    console.log("   - 平台收入:", platformRevenue.toString(), "YD");
    console.log("   - 手续费比例:", feePercentage.toString(), "%");
    
    // 兑换合约状态
    const rates = {
      ethToYd: await exchangeContract.ethToYdRate(),
      ydToEth: await exchangeContract.ydToEthRate(),
      feePercentage: await exchangeContract.feePercentage()
    };
    console.log("💱 兑换合约状态:");
    console.log("   - ETH to YD 比例:", rates.ethToYd.toString());
    console.log("   - YD to ETH 比例:", rates.ydToEthRate.toString());
    console.log("   - 手续费:", rates.feePercentage.toString(), "%");
    
    // NFT合约状态
    const nftName = await courseNFT.name();
    const nftSymbol = await courseNFT.symbol();
    const totalCerts = await courseNFT.totalCertificatesIssued();
    console.log("🏆 NFT证书合约状态:");
    console.log("   - 名称:", nftName);
    console.log("   - 符号:", nftSymbol);
    console.log("   - 已发放证书:", totalCerts.toString());
    
    // 生成部署摘要
    const deploymentSummary = {
      network: {
        name: network.name,
        chainId: network.chainId,
        deployer: deployer.address
      },
      contracts: {
        YDToken: {
          address: ydTokenAddress,
          name: config.tokenName,
          symbol: config.tokenSymbol,
          initialSupply: config.initialSupply,
          maxSupply: config.maxSupply
        },
        CourseContract: {
          address: courseContractAddress,
          platformFeePercentage: feePercentage.toString()
        },
        ExchangeContract: {
          address: exchangeContractAddress,
          feePercentage: rates.feePercentage.toString()
        },
        CourseNFT: {
          address: courseNFTAddress,
          name: nftName,
          symbol: nftSymbol
        }
      },
      timestamp: new Date().toISOString(),
      gasUsed: "待补充" // 可以通过receipt获取
    };
    
    console.log("\n" + "=".repeat(60));
    console.log("🎉 Web3大学系统部署完成!");
    console.log("=".repeat(60));
    
    console.log("\n📋 合约地址总览:");
    console.log("   YD代币合约    :", ydTokenAddress);
    console.log("   课程合约      :", courseContractAddress);
    console.log("   兑换合约      :", exchangeContractAddress);
    console.log("   NFT证书合约   :", courseNFTAddress);
    
    console.log("\n🔍 Etherscan验证命令:");
    console.log(`npx hardhat verify --network ${network.name} ${ydTokenAddress} "${config.tokenName}" "${config.tokenSymbol}" ${config.initialSupply} ${config.decimals} ${config.maxSupply} "${config.initialOwner}"`);
    console.log(`npx hardhat verify --network ${network.name} ${courseContractAddress} "${ydTokenAddress}" "${config.initialOwner}"`);
    console.log(`npx hardhat verify --network ${network.name} ${exchangeContractAddress} "${ydTokenAddress}" "0x0000000000000000000000000000000000000000" "${config.initialOwner}"`);
    console.log(`npx hardhat verify --network ${network.name} ${courseNFTAddress} "${courseContractAddress}" "${config.initialOwner}"`);
    
    console.log("\n📱 前端集成配置:");
    console.log("```javascript");
    console.log("const CONTRACT_ADDRESSES = {");
    console.log(`  YD_TOKEN: "${ydTokenAddress}",`);
    console.log(`  COURSE_CONTRACT: "${courseContractAddress}",`);
    console.log(`  EXCHANGE_CONTRACT: "${exchangeContractAddress}",`);
    console.log(`  COURSE_NFT: "${courseNFTAddress}"`);
    console.log("};");
    console.log("```");
    
    console.log("\n🧪 测试用例:");
    console.log("1. 购买YD代币:");
    console.log(`   - 发送ETH到兑换合约: ${exchangeContractAddress}`);
    console.log("2. 创建课程:");
    console.log(`   - 调用课程合约: ${courseContractAddress}`);
    console.log("3. 购买课程:");
    console.log("   - 先授权YD代币给课程合约");
    console.log("   - 再调用课程合约购买");
    console.log("4. 完成课程获得NFT:");
    console.log(`   - NFT将铸造到: ${courseNFTAddress}`);
    
    console.log("\n💡 下一步操作:");
    console.log("1. 验证所有合约");
    console.log("2. 向兑换合约充值ETH储备");
    console.log("3. 设置USDT合约地址 (如果需要)");
    console.log("4. 配置The Graph索引");
    console.log("5. 部署前端应用");
    
    console.log("\n💾 部署信息已保存:");
    console.log(JSON.stringify(deploymentSummary, null, 2));
    
    return deploymentSummary;
    
  } catch (error) {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then((result) => {
    console.log("\n🏁 Web3大学系统部署脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 脚本执行失败:", error);
    process.exit(1);
  });
