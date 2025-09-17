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

  // Lue代币配置
  const tokenConfig = {
    name: "LueLueLueERC20Token",
    symbol: "Lue", 
    initialSupply: 10000,
    decimals: 0,
    maxSupply: 1000000000,
    owner: deployer.address
  };

  console.log("\n💰 Lue代币分配方案:");
  console.log("   - 总供应量:", tokenConfig.maxSupply.toLocaleString(), tokenConfig.symbol);
  console.log("   - 团队锁仓:", (tokenConfig.maxSupply * 0.2).toLocaleString(), "(20%)");
  console.log("   - 投资人:", (tokenConfig.maxSupply * 0.15).toLocaleString(), "(15%)");
  console.log("   - 学员空投&奖励:", (tokenConfig.maxSupply * 0.3).toLocaleString(), "(30%)");
  console.log("   - 生态&激励:", (tokenConfig.maxSupply * 0.25).toLocaleString(), "(25%)");
  console.log("   - 二级市场流动性:", (tokenConfig.maxSupply * 0.1).toLocaleString(), "(10%)");

  try {
    // 步骤1: 部署Lue代币合约
    console.log("\n🪙 步骤1: 部署Lue代币合约...");
    const MetaCoinFactory = await ethers.getContractFactory("MetaCoin");
    const LueToken = await MetaCoinFactory.deploy(
      tokenConfig.name,
      tokenConfig.symbol, 
      tokenConfig.initialSupply,
      tokenConfig.decimals,
      tokenConfig.maxSupply,
      tokenConfig.owner
    );
    await LueToken.waitForDeployment();
    const LueTokenAddress = await LueToken.getAddress();
    console.log("   ✅ Lue代币合约部署成功:", LueTokenAddress);

    // 步骤2: 部署课程合约
    console.log("\n📚 步骤2: 部署课程合约...");
    const CourseContractFactory = await ethers.getContractFactory("CourseContract");
    const courseContract = await CourseContractFactory.deploy(
      LueTokenAddress,
      deployer.address
    );
    await courseContract.waitForDeployment();
    const courseContractAddress = await courseContract.getAddress();
    console.log("   ✅ 课程合约部署成功:", courseContractAddress);

    // 步骤3: 部署兑换合约
    console.log("\n💱 步骤3: 部署兑换合约...");
    const mockUsdtAddress = "0x1234567890123456789012345678901234567890"; // 测试地址
    const ExchangeContractFactory = await ethers.getContractFactory("ExchangeContract");
    const exchangeContract = await ExchangeContractFactory.deploy(
      LueTokenAddress,
      mockUsdtAddress,
      deployer.address
    );
    await exchangeContract.waitForDeployment();
    const exchangeContractAddress = await exchangeContract.getAddress();
    console.log("   ✅ 兑换合约部署成功:", exchangeContractAddress);

    // 步骤4: 部署NFT证书合约
    console.log("\n🏆 步骤4: 部署NFT证书合约...");
    const CourseNFTFactory = await ethers.getContractFactory("CourseNFT");
    const courseNFT = await CourseNFTFactory.deploy(
      courseContractAddress,
      deployer.address
    );
    await courseNFT.waitForDeployment();
    const courseNFTAddress = await courseNFT.getAddress();
    console.log("   ✅ NFT证书合约部署成功:", courseNFTAddress);

    // 步骤5: 创建示例课程
    console.log("\n📖 步骤5: 创建示例课程...");
    const sampleCourses = [
      { id: "course-blockchain-basics", price: 50 },
      { id: "course-smart-contracts", price: 100 },
      { id: "course-defi-advanced", price: 200 }
    ];
    
    for (const course of sampleCourses) {
      const createTx = await courseContract.createCourse(course.id, course.price);
      await createTx.wait();
      console.log(`   ✅ 创建课程 ${course.id}, 价格: ${course.price} Lue`);
    }

    // 生成部署总结
    const deploymentSummary = {
      network: network.name,
      chainId: network.chainId,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      contracts: {
        LueToken: LueTokenAddress,
        CourseContract: courseContractAddress,
        ExchangeContract: exchangeContractAddress,
        CourseNFT: courseNFTAddress,
        MockUSDT: mockUsdtAddress
      },
      sampleCourses: sampleCourses
    };

    console.log("\n🎉 部署完成!");
    console.log("📋 部署摘要:");
    console.log(JSON.stringify(deploymentSummary, null, 2));

    console.log("\n✅ 验证命令:");
    console.log(`npx hardhat verify --network ${network.name} ${LueTokenAddress} "${tokenConfig.name}" "${tokenConfig.symbol}" ${tokenConfig.initialSupply} ${tokenConfig.decimals} ${tokenConfig.maxSupply} "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${courseContractAddress} "${LueTokenAddress}" "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${exchangeContractAddress} "${LueTokenAddress}" "${mockUsdtAddress}" "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${courseNFTAddress} "${courseContractAddress}" "${deployer.address}"`);

    return deploymentSummary;

  } catch (error) {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🏁 部署脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 脚本执行失败:", error);
    process.exit(1);
  });