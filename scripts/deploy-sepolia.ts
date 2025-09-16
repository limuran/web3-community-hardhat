import { ethers } from "hardhat";
import { parseEther } from "viem";

async function main() {
  console.log("🌐 Sepolia 测试网部署开始...");
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
  
  if (balance < parseEther("0.01")) {
    console.log("⚠️  警告: 账户余额较低，可能不足以支付部署费用");
    console.log("   建议获取更多测试 ETH: https://sepoliafaucet.com/");
  }
  
  // 部署参数配置
  const deployConfig = {
    initialOwner: deployer.address,
    initialSupply: parseEther("10000000"), // 1千万代币用于测试
    tokenName: "Web3 Community Token",
    tokenSymbol: "W3CT"
  };
  
  console.log("\\n⚙️  代币配置:");
  console.log("   - 代币名称:", deployConfig.tokenName);
  console.log("   - 代币符号:", deployConfig.tokenSymbol);
  console.log("   - 初始发行量:", ethers.formatEther(deployConfig.initialSupply), "W3CT");
  console.log("   - 初始所有者:", deployConfig.initialOwner);
  
  console.log("\\n🚀 开始部署合约...");
  
  try {
    // 部署合约
    const Web3CommunityToken = await ethers.getContractFactory("Web3CommunityToken");
    
    console.log("   正在部署合约到 Sepolia...");
    const token = await Web3CommunityToken.deploy(
      deployConfig.initialOwner,
      deployConfig.initialSupply
    );
    
    console.log("   等待交易确认...");
    await token.waitForDeployment();
    
    const contractAddress = await token.getAddress();
    const deployTx = token.deploymentTransaction();
    
    console.log("\\n✅ 部署成功!");
    console.log("=" .repeat(50));
    console.log("📄 合约信息:");
    console.log("   - 合约地址:", contractAddress);
    console.log("   - 交易哈希:", deployTx?.hash);
    console.log("   - Gas 使用量:", deployTx?.gasLimit?.toString());
    
    // 验证合约状态
    console.log("\\n🔍 验证合约状态...");
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const decimals = await token.decimals();
    const owner = await token.owner();
    const maxSupply = await token.MAX_SUPPLY();
    
    console.log("   - 代币名称:", name);
    console.log("   - 代币符号:", symbol);
    console.log("   - 小数位数:", decimals);
    console.log("   - 当前总量:", ethers.formatEther(totalSupply), symbol);
    console.log("   - 最大总量:", ethers.formatEther(maxSupply), symbol);
    console.log("   - 合约所有者:", owner);
    console.log("   - 部署者余额:", ethers.formatEther(await token.balanceOf(deployer.address)), symbol);
    
    // 生成后续操作指南
    console.log("\\n📋 后续操作指南:");
    console.log("=" .repeat(50));
    console.log("\\n1. 📱 添加代币到 MetaMask:");
    console.log("   - 代币地址:", contractAddress);
    console.log("   - 代币符号:", symbol);
    console.log("   - 小数位数:", decimals);
    
    console.log("\\n2. 🔍 在 Etherscan 上查看:");
    console.log("   https://sepolia.etherscan.io/address/" + contractAddress);
    
    console.log("\\n3. ✅ 验证合约源码:");
    console.log("   npx hardhat verify --network sepolia", contractAddress, `"${deployConfig.initialOwner}"`, `"${deployConfig.initialSupply}"`);
    
    console.log("\\n4. 🧪 测试合约功能:");
    console.log("   npx hardhat console --network sepolia");
    console.log("   // 然后在控制台中:");
    console.log(`   const token = await ethers.getContractAt("Web3CommunityToken", "${contractAddress}");`);
    console.log("   await token.name(); // 查看代币名称");
    
    console.log("\\n5. 💰 获取测试 ETH:");
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
        name: name,
        symbol: symbol,
        decimals: decimals.toString(),
        totalSupply: totalSupply.toString(),
        maxSupply: maxSupply.toString(),
        owner: owner,
        initialSupply: deployConfig.initialSupply.toString()
      }
    };
    
    console.log("\\n💾 部署信息已保存:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\\n🎉 Sepolia 测试网部署完成!");
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
    console.log("\\n🏁 脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\\n💥 脚本执行失败:", error);
    process.exit(1);
  });
