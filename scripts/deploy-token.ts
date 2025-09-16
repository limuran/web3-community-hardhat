import { ethers } from "hardhat";
import { parseEther } from "viem";

async function main() {
  console.log("🚀 Starting Web3CommunityToken deployment...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // 部署参数
  const initialOwner = deployer.address;
  const initialSupply = parseEther("100000000"); // 1亿代币
  
  console.log("⚙️  Deployment parameters:");
  console.log("   - Initial Owner:", initialOwner);
  console.log("   - Initial Supply:", ethers.formatEther(initialSupply.toString()), "W3CT");
  
  // 部署合约
  const Web3CommunityTokenFactory = await ethers.getContractFactory("Web3CommunityToken");
  const web3CommunityToken = await Web3CommunityTokenFactory.deploy(initialOwner, initialSupply);
  
  console.log("⏳ Waiting for deployment transaction...");
  await web3CommunityToken.waitForDeployment();
  
  const contractAddress = await web3CommunityToken.getAddress();
  console.log("✅ Web3CommunityToken deployed to:", contractAddress);
  
  // 验证部署
  console.log("🔍 Verifying deployment...");
  const name = await web3CommunityToken.name();
  const symbol = await web3CommunityToken.symbol();
  const totalSupply = await web3CommunityToken.totalSupply();
  const decimals = await web3CommunityToken.decimals();
  const maxSupply = await web3CommunityToken.MAX_SUPPLY();
  const owner = await web3CommunityToken.owner();
  
  console.log("📊 Contract Details:");
  console.log("   - Name:", name);
  console.log("   - Symbol:", symbol);
  console.log("   - Decimals:", decimals);
  console.log("   - Total Supply:", ethers.formatEther(totalSupply.toString()), symbol);
  console.log("   - Max Supply:", ethers.formatEther(maxSupply.toString()), symbol);
  console.log("   - Owner:", owner);
  
  console.log("\\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🔗 Add to MetaMask or use in your dApp!");
  
  // 保存部署信息
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: web3CommunityToken.deploymentTransaction()?.hash,
    blockNumber: await deployer.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    contractDetails: {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      maxSupply: maxSupply.toString(),
      owner
    }
  };
  
  console.log("\\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
