import hre from "hardhat";

async function main() {
  console.log("🎓 Web3大学系统部署");
  
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  
  console.log("📋 部署信息:");
  console.log("   - 网络:", network.name);
  console.log("   - 账户:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   - 余额:", hre.ethers.formatEther(balance), "ETH");

  const tokenConfig = {
    name: "LueLueLueERC20Token",
    symbol: "Lue", 
    initialSupply: 10000,
    decimals: 0,
    maxSupply: 1000000000,
    owner: deployer.address
  };

  try {
    // 部署YD代币
    console.log("\n🪙 部署YD代币...");
    const MetaCoinFactory = await hre.ethers.getContractFactory("MetaCoin");
    const ydToken = await MetaCoinFactory.deploy(
      tokenConfig.name,
      tokenConfig.symbol, 
      tokenConfig.initialSupply,
      tokenConfig.decimals,
      tokenConfig.maxSupply,
      tokenConfig.owner
    );
    await ydToken.waitForDeployment();
    const ydTokenAddress = await ydToken.getAddress();
    console.log("✅ YD代币:", ydTokenAddress);

    // 部署课程合约
    console.log("\n📚 部署课程合约...");
    const CourseContractFactory = await hre.ethers.getContractFactory("CourseContract");
    const courseContract = await CourseContractFactory.deploy(ydTokenAddress, deployer.address);
    await courseContract.waitForDeployment();
    const courseContractAddress = await courseContract.getAddress();
    console.log("✅ 课程合约:", courseContractAddress);

    // 部署兑换合约
    console.log("\n💱 部署兑换合约...");
    const mockUsdtAddress = "0x1234567890123456789012345678901234567890";
    const ExchangeContractFactory = await hre.ethers.getContractFactory("ExchangeContract");
    const exchangeContract = await ExchangeContractFactory.deploy(ydTokenAddress, mockUsdtAddress, deployer.address);
    await exchangeContract.waitForDeployment();
    const exchangeContractAddress = await exchangeContract.getAddress();
    console.log("✅ 兑换合约:", exchangeContractAddress);

    // 部署NFT合约
    console.log("\n🏆 部署NFT合约...");
    const CourseNFTFactory = await hre.ethers.getContractFactory("CourseNFT");
    const courseNFT = await CourseNFTFactory.deploy(courseContractAddress, deployer.address);
    await courseNFT.waitForDeployment();
    const courseNFTAddress = await courseNFT.getAddress();
    console.log("✅ NFT合约:", courseNFTAddress);

    const deploymentSummary = {
      network: network.name,
      deployer: deployer.address,
      contracts: {
        YDToken: ydTokenAddress,
        CourseContract: courseContractAddress,
        ExchangeContract: exchangeContractAddress,
        CourseNFT: courseNFTAddress
      }
    };

    console.log("\n🎉 部署完成!");
    console.log(JSON.stringify(deploymentSummary, null, 2));

    console.log("\n✅ 验证命令:");
    console.log(`npx hardhat verify --network ${network.name} ${ydTokenAddress} "${tokenConfig.name}" "${tokenConfig.symbol}" ${tokenConfig.initialSupply} ${tokenConfig.decimals} ${tokenConfig.maxSupply} "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${courseContractAddress} "${ydTokenAddress}" "${deployer.address}"`);

    return deploymentSummary;

  } catch (error) {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});