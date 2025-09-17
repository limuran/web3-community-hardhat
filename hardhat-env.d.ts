
/// <reference types="@nomicfoundation/hardhat-toolbox/internal/type-extensions" />
/// <reference types="@nomicfoundation/hardhat-toolbox-viem/internal/type-extensions" />

import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";

declare module "hardhat/types" {
  interface HardhatRuntimeEnvironment {
    ethers: HardhatEthersHelpers;
  }
}

// 如果使用 viem
declare module "hardhat/types" {
  interface HardhatRuntimeEnvironment {
    viem: import("@nomicfoundation/hardhat-viem/types").HardhatViemHelpers;
  }
}