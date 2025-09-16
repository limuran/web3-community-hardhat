import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

/**
 * Web3CommunityToken 部署模块
 */
export default buildModule("Web3CommunityTokenModule", (m) => {
  // 部署参数
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // 默认为 Hardhat 第一个账户
  const initialSupply = m.getParameter("initialSupply", parseEther("100000000")); // 1亿代币初始发行量
  
  // 部署 Web3CommunityToken 合约
  const Web3CommunityToken = m.contract("Web3CommunityToken", [
    initialOwner,
    initialSupply,
  ]);

  // 返回部署的合约实例
  return { Web3CommunityToken };
});
