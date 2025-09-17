# 🚀 Web3大学快速部署指南

## ✅ 问题修复

### 1. Ethers 导入问题已解决
- 使用 `import hre from "hardhat"` 替代 `import { ethers } from "hardhat"`
- 通过 `hre.ethers` 访问 ethers 功能

### 2. Scripts 已精简
只保留必要的脚本命令：
- `compile` - 编译合约
- `test` - 运行测试  
- `deploy:sepolia` - 部署 MetaCoin
- `deploy:web3university` - 部署完整系统
- `verify` - 验证合约
- `console` - Hardhat 控制台

## 🎯 立即部署步骤

### 1. 项目准备
```bash
# 克隆项目
git clone https://github.com/limuran/web3-community-hardhat.git
cd web3-community-hardhat

# 安装依赖
npm install
```

### 2. 环境配置
```bash
# 复制环境模板
cp .env.sepolia .env

# 编辑 .env 文件
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here  
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 编译和测试
```bash
# 编译所有合约
npm run compile

# 运行测试
npm run test

# 查看测试覆盖率
npm run coverage
```

### 4. 部署选择

#### 选项A: 只部署 MetaCoin (简单)
```bash
npm run deploy:sepolia
```

#### 选项B: 部署完整 Web3大学系统 (推荐)
```bash
npm run deploy:web3university
```

### 5. 验证合约
```bash
# 使用脚本输出的验证命令
npm run verify CONTRACT_ADDRESS CONSTRUCTOR_ARGS...
```

### 6. 测试部署结果
```bash
# 进入控制台
npm run console

# 测试合约
const ydToken = await hre.ethers.getContractAt("MetaCoin", "CONTRACT_ADDRESS");
await ydToken.getTokenInfo();
```

## 🎉 部署成功！

部署完成后你将拥有：
- ✅ YD代币合约 (LueLue代币)
- ✅ 课程管理合约
- ✅ 代币兑换合约  
- ✅ NFT证书合约
- ✅ 完整的手续费机制
- ✅ 用户权限验证系统

## 📋 可用命令总览

```bash
# 基础命令
npm run compile          # 编译合约
npm run test            # 运行测试
npm run clean           # 清理缓存

# 部署命令  
npm run deploy:sepolia           # 部署 MetaCoin
npm run deploy:web3university    # 部署完整系统

# 工具命令
npm run verify          # 验证合约
npm run console         # Hardhat 控制台

# Ignition 部署 (可选)
npm run ignition:metacoin        # 用 Ignition 部署 MetaCoin
npm run ignition:web3university  # 用 Ignition 部署完整系统

# 测试命令
npm run test:metacoin   # 只测试 MetaCoin
npm run coverage        # 测试覆盖率
```

现在你可以立即开始部署你的Web3大学项目了！🚀
