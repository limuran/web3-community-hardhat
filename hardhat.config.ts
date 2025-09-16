import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    // Ethereum 测试网
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    // Ethereum 主网
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("MAINNET_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
    },
    // Polygon 主网
    polygon: {
      type: "http",
      url: configVariable("POLYGON_RPC_URL"),
      accounts: [configVariable("POLYGON_PRIVATE_KEY")],
      chainId: 137,
    },
    // BSC 主网
    bsc: {
      type: "http",
      url: configVariable("BSC_RPC_URL"),
      accounts: [configVariable("BSC_PRIVATE_KEY")],
      chainId: 56,
    },
  },
  // 合约验证配置
  etherscan: {
    apiKey: {
      mainnet: configVariable("ETHERSCAN_API_KEY"),
      sepolia: configVariable("ETHERSCAN_API_KEY"),
      polygon: configVariable("POLYGONSCAN_API_KEY"),
      bsc: configVariable("BSCSCAN_API_KEY"),
    },
  },
  // Gas 费用报告
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
