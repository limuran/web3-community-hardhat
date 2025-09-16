# Web3 Community Token - Deployment Guide

## 📋 项目概述

这是一个完整的 Web3 社区代币发行项目，使用 Hardhat 3 构建，包含：
- ✅ 增强型 ERC20 代币合约 (Web3CommunityToken)
- ✅ 完整的测试套件
- ✅ 多网络部署配置
- ✅ 合约验证配置

## 🚀 快速开始

### 1. 环境配置

```bash
# 克隆项目
git clone https://github.com/limuran/web3-community-hardhat.git
cd web3-community-hardhat

# 安装依赖
npm install
# 或者
yarn install
```

### 2. 环境变量配置

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的参数：
```env
# 网络RPC端点 (从 Alchemy、Infura 等获取)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BSC_RPC_URL=https://bsc-dataseed1.binance.org/

# 私钥 (用于部署的账户私钥，确保有足够的 ETH)
SEPOLIA_PRIVATE_KEY=your_private_key_here

# API Keys (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 编译合约

```bash
npm run contracts:compile
```

### 4. 运行测试

```bash
# 运行所有测试
npm run contracts:test

# 运行指定测试文件
npm run test:contracts

# 生成测试覆盖率报告
npm run coverage
```

## 📦 代币合约功能

### Web3CommunityToken 特性：

- **基础 ERC20 功能**：转账、授权、余额查询
- **铸币功能**：支持多个铸币者，最大供应量限制
- **燃烧功能**：持有者可以销毁自己的代币
- **暂停功能**：紧急情况下可暂停所有转账
- **批量转账**：一次性向多个地址转账
- **许可转账**：支持 EIP-2612 离线签名授权
- **所有权管理**：基于 OpenZeppelin Ownable 合约

### 代币参数：
- **名称**: Web3 Community Token
- **符号**: W3CT
- **精度**: 18
- **最大供应量**: 1,000,000,000 W3CT
- **初始发行量**: 100,000,000 W3CT (可配置)

## 🌍 部署到不同网络

### 本地测试网络
```bash
# 启动本地 Hardhat 网络
npx hardhat node

# 部署到本地网络 (另一个终端)
npm run contracts:deploy
```

### 测试网部署

**Sepolia 测试网：**
```bash
# 使用传统脚本部署
npm run contracts:deploy:sepolia

# 或使用 Hardhat Ignition 部署
npm run ignition:deploy:sepolia
```

### 主网部署

⚠️ **注意：主网部署会花费真实的 ETH，请确保充分测试！**

```bash
# Ethereum 主网
npm run contracts:deploy:mainnet

# Polygon 主网
npm run contracts:deploy:polygon

# BSC 主网
npm run contracts:deploy:bsc
```

## 🔍 合约验证

部署后验证合约源码：

```bash
# 替换为实际的合约地址和构造函数参数
npx hardhat verify --network sepolia CONTRACT_ADDRESS "INITIAL_OWNER_ADDRESS" "INITIAL_SUPPLY"

# 示例
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890 "0xYourAddress" "100000000000000000000000000"
```

## 📊 部署后操作

### 1. 验证部署
```bash
# 查看代币信息
npx hardhat console --network sepolia
```

在控制台中：
```javascript
const token = await ethers.getContractAt("Web3CommunityToken", "CONTRACT_ADDRESS");
console.log("Name:", await token.name());
console.log("Symbol:", await token.symbol());
console.log("Total Supply:", ethers.formatEther(await token.totalSupply()));
```

### 2. 管理操作

**添加铸币者：**
```javascript
await token.addMinter("0xNewMinterAddress");
```

**铸造代币：**
```javascript
await token.mint("0xRecipientAddress", ethers.parseEther("1000"));
```

**暂停合约：**
```javascript
await token.pause();
```

## 🛡️ 安全注意事项

1. **私钥管理**：
   - 不要在代码中硬编码私钥
   - 使用环境变量或 Hardhat Keystore
   - 生产环境使用多签钱包

2. **合约权限**：
   - 及时转移所有权到多签钱包
   - 谨慎添加铸币者权限
   - 定期审查权限设置

3. **部署前检查**：
   - 运行完整测试套件
   - 在测试网充分验证
   - 检查 Gas 费用设置

## 🔧 高级配置

### 自定义部署参数

编辑 `ignition/modules/Web3CommunityToken.ts`：
```typescript
const initialOwner = m.getParameter("initialOwner", "YOUR_ADDRESS");
const initialSupply = m.getParameter("initialSupply", parseEther("50000000")); // 5千万代币
```

### Gas 优化

在 `hardhat.config.ts` 中调整优化器设置：
```typescript
optimizer: {
  enabled: true,
  runs: 1000, // 增加运行次数以优化 Gas
}
```

## 📱 添加到 MetaMask

部署成功后，可以将代币添加到 MetaMask：

1. 打开 MetaMask
2. 点击 "Import tokens"
3. 输入合约地址
4. 代币符号和精度会自动填充

## 🐛 常见问题

### 1. 编译错误
```bash
# 清理缓存重新编译
npx hardhat clean
npm run contracts:compile
```

### 2. 测试失败
```bash
# 检查依赖版本
npm list @openzeppelin/contracts
# 更新依赖
npm update
```

### 3. 部署失败
- 检查网络连接
- 确保账户有足够 ETH 支付 Gas
- 检查 RPC 端点是否有效

## 📚 相关资源

- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts)
- [ERC20 标准](https://eips.ethereum.org/EIPS/eip-20)
- [Etherscan](https://etherscan.io/) - 查看和验证合约

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

---

**⚡ 快速命令参考：**

```bash
# 开发环境设置
npm install && npm run contracts:compile

# 测试
npm run contracts:test

# 部署到 Sepolia 测试网
npm run contracts:deploy:sepolia

# 验证合约
npx hardhat verify --network sepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

🎉 **祝你发币成功！**
