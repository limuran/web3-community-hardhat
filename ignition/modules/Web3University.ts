import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Web3大学完整系统部署模块
 * 包含：YD代币(MetaCoin)、课程合约、兑换合约、NFT证书合约
 */
export default buildModule("Web3UniversityModule", (m) => {
  // 1. 部署YD代币合约 (MetaCoin增强版)
  const tokenName = m.getParameter("tokenName", "LueLueLueERC20Token");
  const tokenSymbol = m.getParameter("tokenSymbol", "Lue");
  const initialSupply = m.getParameter("initialSupply", 10000);
  const decimals = m.getParameter("decimals", 0);
  const maxSupply = m.getParameter("maxSupply", 1000000000); // 10亿最大供应量
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

  // 部署YD代币
  const YDToken = m.contract("MetaCoin", [
    tokenName,
    tokenSymbol,
    initialSupply,
    decimals,
    maxSupply,
    initialOwner,
  ]);

  // 2. 部署课程合约
  const CourseContract = m.contract("CourseContract", [
    YDToken, // YD代币地址
    initialOwner, // 合约所有者
  ]);

  // 3. 部署兑换合约
  // 模拟USDT地址 (测试网可以用自己部署的ERC20)
  const mockUsdtAddress = m.getParameter("usdtAddress", "0x1234567890123456789012345678901234567890");
  
  const ExchangeContract = m.contract("ExchangeContract", [
    YDToken, // YD代币地址
    mockUsdtAddress, // USDT代币地址
    initialOwner, // 合约所有者
  ]);

  // 4. 部署NFT证书合约
  const CourseNFT = m.contract("CourseNFT", [
    CourseContract, // 课程合约地址
    initialOwner, // 合约所有者
  ]);

  // 5. 配置合约之间的关联关系
  // 这些操作需要在部署后手动调用或通过后置脚本执行

  return {
    YDToken,
    CourseContract,
    ExchangeContract,
    CourseNFT,
    // 返回配置信息供前端使用
    config: {
      tokenName,
      tokenSymbol,
      initialSupply,
      maxSupply,
      decimals,
      initialOwner
    }
  };
});
