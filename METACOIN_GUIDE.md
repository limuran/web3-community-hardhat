# 🚀 增强版 MetaCoin 部署指南

## 🎯 项目概述

基于你原有的 `MetaCoin.sol` 合约，我们添加了强大的新功能，同时保持了你的原始设计风格：

### 🔄 **保持的原始特性**
- ✅ 代币名称: "LueLueLueERC20Token" 
- ✅ 代币符号: "Lue"
- ✅ 初始发行量: 10,000 Lue
- ✅ 小数位数: 0 (你的独特设计)
- ✅ 基础 ERC20 功能

### 🆕 **新增强功能**
- 🏭 **铸币管理** - 支持多个授权铸币者
- 🔥 **代币燃烧** - 持有者可销毁代币
- ⏸️ **暂停功能** - 紧急情况下暂停转账
- 🚫 **黑名单管理** - 防止恶意地址参与
- 📦 **批量操作** - 批量转账和铸币
- 📊 **详细统计** - 完整的合约状态查询
- 🔒 **安全控制** - 最大供应量限制和权限管理

## 🌐 **Sepolia 测试网部署**

### 1. 准备工作

**获取测试资源:**
```bash
# 测试 ETH 水龙头
https://sepoliafaucet.com/
https://faucet.sepolia.dev/

# 获取 API Keys
- Alchemy/Infura RPC URL
- Etherscan API Key
```

### 2. 环境配置

```bash
# 复制配置模板
cp .env.sepolia .env

# 编辑配置文件
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 部署流程

```bash
# 安装依赖
npm install

# 编译合约
npm run contracts:compile

# 运行测试 (验证增强功能)
npm run metacoin:test

# 部署到 Sepolia
npm run sepolia:deploy
# 或者
npm run metacoin:deploy
```

### 4. 部署成功输出示例

```
🌐 Sepolia 测试网 - MetaCoin 增强版部署
📄 合约信息:
   - 合约地址: 0x1234567890123456789012345678901234567890
   - 代币名称: LueLueLueERC20Token
   - 代币符号: Lue
   - 当前总量: 10000 Lue
   - 最大供应量: 100000000 Lue
   - 小数位数: 0

🆕 新增功能特性:
   ✅ 铸币功能 (仅授权用户)
   ✅ 燃烧功能 (任何持有者)
   ✅ 暂停功能 (紧急情况)
   ✅ 黑名单管理 (安全控制)
   ✅ 批量转账/铸币 (效率提升)
   ✅ 最大供应量限制 (经济控制)
```

### 5. 验证合约

```bash
# 使用脚本输出的验证命令
npx hardhat verify --network sepolia CONTRACT_ADDRESS "LueLueLueERC20Token" "Lue" 10000 0 100000000 "OWNER_ADDRESS"
```

## 🧪 **测试新功能**

### 基础查询
```bash
# 进入控制台
npm run sepolia:console

# 连接合约
const token = await ethers.getContractAt("MetaCoin", "CONTRACT_ADDRESS");

# 查看基本信息
await token.getTokenInfo();
await token.getStats();
```

### 高级功能测试
```javascript
// 查看代币信息 (保持原有设计)
await token.name(); // "LueLueLueERC20Token"
await token.symbol(); // "Lue"
await token.decimals(); // 0
await token.totalSupply(); // 10000

// 新增功能测试
await token.remainingMintableSupply(); // 剩余可铸造量
await token.isMinter(ownerAddress); // 检查铸币权限
await token.isBlacklisted(address); // 检查黑名单状态

// 铸币功能 (仅限授权用户)
await token.mint(recipientAddress, 1000);

// 批量转账
await token.batchTransfer([addr1, addr2], [100, 200]);

// 燃烧代币
await token.burn(500);

// 管理功能 (仅限所有者)
await token.addMinter(newMinterAddress);
await token.addToBlacklist(maliciousAddress);
await token.pause(); // 紧急暂停
```

## 📊 **代币经济学**

### 供应模型
- **初始发行**: 10,000 Lue (发给部署者)
- **最大供应**: 100,000,000 Lue (1万倍增长空间)
- **精度设计**: 0 小数位 (保持整数，独特设计)
- **增发机制**: 仅授权铸币者可增发
- **通缩机制**: 任何持有者可燃烧代币

### 治理模型
- **所有者权限**: 添加/移除铸币者、黑名单管理、暂停功能
- **铸币者权限**: 铸造新代币（不超过最大供应量）
- **持有者权限**: 转账、燃烧、批量操作

## 🔒 **安全特性**

### 访问控制
- 基于 OpenZeppelin Ownable 的所有权管理
- 多重铸币者授权机制
- 黑名单功能防止恶意地址

### 经济安全
- 最大供应量限制防止无限增发
- 暂停功能应对紧急情况
- 详细事件记录便于监控

### 代码安全
- 基于 OpenZeppelin 5.4.0 标准库
- 多重继承冲突解决
- 全面的边界条件检查

## 📱 **MetaMask 集成**

添加代币到 MetaMask:
1. 合约地址: `YOUR_CONTRACT_ADDRESS`
2. 代币符号: `Lue`
3. 小数精度: `0`

## 🔧 **故障排除**

### 常见问题
1. **编译失败**: `npx hardhat clean && npm run contracts:compile`
2. **测试失败**: 检查 OpenZeppelin 版本兼容性
3. **部署失败**: 确保有足够测试 ETH
4. **验证失败**: 确保构造参数完全匹配

### 调试技巧
```bash
# 查看详细错误
npm run metacoin:test -- --verbose

# 检查合约状态
npm run sepolia:console
# 然后查询合约状态
```

## 🎯 **下一步建议**

1. **测试完整功能** - 在 Sepolia 上测试所有新功能
2. **社区反馈** - 收集用户对新功能的反馈
3. **安全审计** - 考虑第三方安全审计
4. **主网部署** - 充分测试后考虑主网部署
5. **生态建设** - 与 DeFi 协议集成

## 🔗 **有用链接**

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **测试 ETH 水龙头**: https://sepoliafaucet.com/
- **Alchemy**: https://www.alchemy.com/
- **OpenZeppelin 文档**: https://docs.openzeppelin.com/contracts

## ⚡ **快速命令参考**

```bash
# 一键部署流程
npm install && npm run contracts:compile && npm run sepolia:deploy

# 测试所有功能
npm run metacoin:test

# 验证合约 (替换实际参数)
npm run sepolia:verify CONTRACT_ADDRESS "LueLueLueERC20Token" "Lue" 10000 0 100000000 "OWNER_ADDRESS"

# 控制台测试
npm run sepolia:console
```

---

**🎉 现在你的 MetaCoin 不仅保持了原有的独特设计，还具备了现代 DeFi 代币的强大功能！**
