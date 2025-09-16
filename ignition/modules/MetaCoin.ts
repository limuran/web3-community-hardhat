import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

/**
 * Enhanced MetaCoin 部署模块
 * 支持自定义配置，保持原有设计风格
 */
export default buildModule("EnhancedMetaCoinModule", (m) => {
  // 部署参数 - 可以保持原有的默认值或自定义
  const tokenName = m.getParameter("tokenName", "LueLueLueERC20Token"); // 保持原名称
  const tokenSymbol = m.getParameter("tokenSymbol", "Lue"); // 保持原符号
  const initialSupply = m.getParameter("initialSupply", 10000); // 保持原发行量
  const decimals = m.getParameter("decimals", 0); // 保持原精度设计
  const maxSupply = m.getParameter("maxSupply", 100000000); // 设置最大供应量为1亿（原来的10000倍）
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  
  // 部署增强版 MetaCoin 合约
  const MetaCoin = m.contract("MetaCoin", [
    tokenName,
    tokenSymbol,
    initialSupply,
    decimals,
    maxSupply,
    initialOwner,
  ]);

  // 返回部署的合约实例
  return { MetaCoin };
});
