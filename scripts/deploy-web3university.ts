import hre from "hardhat";
import { formatEther, parseUnits } from "viem";

async function main() {
  console.log("🎓 Web3大学系统 - 完整部署");
  console.log("="*50);
  
  // 获取 viem 客户端
  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();
  
  console.log("\n📋 部署信息:");
  console.log("   - 网络:", hre.network.name);
  console.log("   - 账户:", deployer.account.address);
  
  const balance = await publicClient.getBalance({
    address: deployer.account.address
  });
  console.log("   - 余额:", formatEther(balance), "ETH");

  const deploymentResults = {
    tokenAddress: "",
    exchangeAddress: "",
    courseAddress: "",
    certificateAddress: "",
    deployer: deployer.account.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  try {
    // 1. 部署 LueToken
    console.log("\n🪙 1/4 部署 LueToken...");
    const lueToken = await hre.viem.deployContract("LueToken", [
      "LueLueLue",                    // name
      "Lue",                          // symbol
      1000000n,                       // initialSupply (100万)
      0,                              // decimals
      100000000n,                     // maxSupply (1亿)
      deployer.account.address        // initialOwner
    ]);
    
    deploymentResults.tokenAddress = lueToken.address;
    console.log("   ✅ LueToken 部署成功:", lueToken.address);

    // 2. 部署 TokenExchange
    console.log("\n💱 2/4 部署 TokenExchange...");
    const tokenExchange = await hre.viem.deployContract("TokenExchange", [
      lueToken.address,               // _lueToken
      parseUnits("0.0001", 18),       // _lueToEthRate (1 Lue = 0.0001 ETH)
      10000n,                         // _ethToLueRate (1 ETH = 10000 Lue)
      6n,                             // _lueToUsdtRate (1 Lue = 6 USDT)
      6n                              // _usdtToLueRate (1 USDT = 6 Lue)
    ]);
    
    deploymentResults.exchangeAddress = tokenExchange.address;
    console.log("   ✅ TokenExchange 部署成功:", tokenExchange.address);

    // 3. 部署 CoursePurchase
    console.log("\n📚 3/4 部署 CoursePurchase...");
    const coursePurchase = await hre.viem.deployContract("CoursePurchase", [
      lueToken.address,               // _lueToken
      250n                            // _platformFeePercentage (2.5%)
    ]);
    
    deploymentResults.courseAddress = coursePurchase.address;
    console.log("   ✅ CoursePurchase 部署成功:", coursePurchase.address);

    // 4. 部署 CourseCertificate
    console.log("\n🎓 4/4 部署 CourseCertificate...");
    const courseCertificate = await hre.viem.deployContract("CourseCertificate", [
      "Web3 University Certificate",   // name
      "W3UC"                           // symbol
    ]);
    
    deploymentResults.certificateAddress = courseCertificate.address;
    console.log("   ✅ CourseCertificate 部署成功:", courseCertificate.address);

    // 5. 配置合约交互权限
    console.log("\n🔧 配置合约权限...");
    
    // 给 Exchange 合约转入一些 Lue 代币用于兑换
    const transferAmount = 100000n; // 10万 Lue
    await lueToken.write.transfer([tokenExchange.address, transferAmount]);
    console.log(`   ✅ 向 Exchange 转入 ${transferAmount} Lue`);

    // 给 Exchange 合约发送一些 ETH
    const ethAmount = parseUnits("1", 18); // 1 ETH
    await deployer.sendTransaction({
      to: tokenExchange.address,
      value: ethAmount
    });
    console.log(`   ✅ 向 Exchange 转入 ${formatEther(ethAmount)} ETH`);

    // 6. 验证部署结果
    console.log("\n📊 验证部署状态:");
    
    const tokenInfo = await lueToken.read.getTokenInfo();
    console.log("   - Lue 总供应量:", tokenInfo[2].toString());
    
    const exchangeBalance = await lueToken.read.balanceOf([tokenExchange.address]);
    console.log("   - Exchange Lue余额:", exchangeBalance.toString());
    
    const exchangeEthBalance = await publicClient.getBalance({
      address: tokenExchange.address
    });
    console.log("   - Exchange ETH余额:", formatEther(exchangeEthBalance));

    // 打印部署摘要
    console.log("\n" + "="*50);
    console.log("🎉 部署完成!");
    console.log("\n📋 部署摘要:");
    console.log(JSON.stringify(deploymentResults, null, 2));

    // 打印验证命令
    console.log("\n📝 合约验证命令:");
    console.log("```bash");
    console.log(`# LueToken`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${lueToken.address} "LueLueLue" "Lue" 1000000 0 100000000 "${deployer.account.address}"`);
    console.log(`\n# TokenExchange`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${tokenExchange.address} "${lueToken.address}" "${parseUnits("0.0001", 18)}" 10000 6 6`);
    console.log(`\n# CoursePurchase`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${coursePurchase.address} "${lueToken.address}" 250`);
    console.log(`\n# CourseCertificate`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${courseCertificate.address} "Web3 University Certificate" "W3UC"`);
    console.log("```");

    // 打印 Etherscan 链接
    console.log("\n🔗 Etherscan 链接:");
    console.log(`   - LueToken: https://sepolia.etherscan.io/address/${lueToken.address}`);
    console.log(`   - TokenExchange: https://sepolia.etherscan.io/address/${tokenExchange.address}`);
    console.log(`   - CoursePurchase: https://sepolia.etherscan.io/address/${coursePurchase.address}`);
    console.log(`   - CourseCertificate: https://sepolia.etherscan.io/address/${courseCertificate.address}`);

    return deploymentResults;

  } catch (error) {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});