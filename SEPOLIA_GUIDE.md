# 🌐 Sepolia 测试网部署指南

## 🚀 快速部署步骤

### 准备工作

1. **获取 Sepolia 测试 ETH**
   - 访问: https://sepoliafaucet.com/
   - 获取至少 0.1 ETH 用于部署

2. **获取 RPC URL**
   - 注册 Alchemy 或 Infura
   - 创建项目，选择 Sepolia 网络
   - 复制 RPC URL

3. **获取 Etherscan API Key**
   - 注册 Etherscan
   - 创建免费 API Key

### 配置环境

```bash
# 复制环境配置
cp .env.sepolia .env
```

编辑 `.env` 文件:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 部署流程

```bash
# 1. 安装依赖
npm install

# 2. 编译合约
npm run contracts:compile

# 3. 运行测试（可选）
npm run contracts:test

# 4. 部署到 Sepolia
npm run sepolia:deploy
```

### 验证合约

```bash
# 使用脚本输出的验证命令
npx hardhat verify --network sepolia CONTRACT_ADDRESS "OWNER_ADDRESS" "INITIAL_SUPPLY"
```

### 测试合约

```bash
# 进入 Hardhat 控制台
npm run sepolia:console

# 在控制台中测试
const token = await ethers.getContractAt("Web3CommunityToken", "YOUR_CONTRACT_ADDRESS");
await token.name(); // 查看代币名称
await token.symbol(); // 查看代币符号
await token.totalSupply(); // 查看总供应量
```

## 📊 代币信息

- **名称**: Web3 Community Token
- **符号**: W3CT
- **精度**: 18
- **初始发行**: 10,000,000 W3CT（测试用）
- **最大供应**: 1,000,000,000 W3CT

## 🔧 常见问题

### 部署失败
- **insufficient funds**: 获取更多测试 ETH
- **invalid private key**: 检查私钥格式，确保以 0x 开头
- **network connection failed**: 检查 RPC URL 是否正确

### 验证失败
- 确保构造函数参数正确
- 等待几个区块确认后再验证
- 检查 Etherscan API Key 是否有效

## 📱 添加到 MetaMask

1. 打开 MetaMask，切换到 Sepolia 测试网
2. 点击 "导入代币"
3. 输入合约地址
4. 代币符号和精度会自动填充

## 🔗 有用链接

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://infura.io/

---

**🎉 部署成功后，你就有了自己的 ERC20 代币！**