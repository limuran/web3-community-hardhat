# 🚀 Web3大学项目启动检查清单

## ✅ 部署前检查清单

### 1. 环境准备
- [ ] Node.js >= 18.0.0 已安装
- [ ] 获得Sepolia测试ETH (至少0.1 ETH)
- [ ] 申请Alchemy/Infura RPC URL
- [ ] 获取Etherscan API Key
- [ ] 创建专用测试钱包

### 2. 项目配置
```bash
# 克隆项目
git clone https://github.com/limuran/web3-community-hardhat.git
cd web3-community-hardhat

# 安装依赖
npm install

# 配置环境变量
cp .env.sepolia .env
```

编辑 .env 文件：
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 合约编译和测试
```bash
# 编译所有合约
npm run contracts:compile

# 运行完整测试套件
npm run contracts:test

# 检查测试覆盖率
npm run coverage
```

## 🎯 正式部署步骤

### 第一步：部署完整系统
```bash
# 部署所有合约到Sepolia
npm run sepolia:deploy
```

部署成功后会看到类似输出：
```
🎓 Web3大学完整系统部署
✅ YD代币合约部署成功: 0x...
✅ 课程合约部署成功: 0x...
✅ 兑换合约部署成功: 0x...
✅ NFT证书合约部署成功: 0x...
```

### 第二步：验证合约
```bash
# 使用脚本输出的验证命令
npx hardhat verify --network sepolia YD_TOKEN_ADDRESS "LueLueLueERC20Token" "Lue" 10000 0 1000000000 "YOUR_ADDRESS"
# ... 其他合约验证命令
```

### 第三步：初始化测试数据
```bash
# 进入Hardhat控制台
npm run sepolia:console
```

在控制台中运行：
```javascript
// 连接合约
const ydToken = await ethers.getContractAt("MetaCoin", "YD_TOKEN_ADDRESS");
const courseContract = await ethers.getContractAt("CourseContract", "COURSE_CONTRACT_ADDRESS");

// 验证部署
console.log("代币信息:", await ydToken.getTokenInfo());
console.log("示例课程:", await courseContract.getCourseInfo("course-blockchain-basics"));
```

## 📋 部署后验证清单

### 合约功能验证
- [ ] YD代币基础功能正常
- [ ] 课程创建和购买流程
- [ ] 兑换功能正常工作
- [ ] NFT铸造功能
- [ ] 权限控制有效

### 数据架构验证
- [ ] RPC调用响应正常
- [ ] 合约事件正确触发
- [ ] 状态更新准确
- [ ] Gas费用合理

## 🎉 项目里程碑

### MVP功能（已完成）✅
- [x] YD代币系统
- [x] 课程管理
- [x] 购买和权限验证
- [x] 代币兑换
- [x] NFT证书

### V1.0 规划
- [ ] 前端界面开发
- [ ] The Graph集成
- [ ] 用户注册系统
- [ ] 课程内容管理
- [ ] 移动端支持

### V1.1 增强功能
- [ ] AAVE质押集成
- [ ] DAO治理功能
- [ ] 学习挖矿奖励
- [ ] 社交功能
- [ ] 多链部署

## 📞 部署支持

如遇到问题，请检查：
1. 网络连接和RPC设置
2. 钱包余额和私钥配置
3. 合约编译错误
4. Gas费用设置
5. 网络拥堵情况

---

**🚀 准备就绪！让我们开始Web3教育革命！**

记录你的部署信息：
- YD代币地址: ________________
- 课程合约地址: ________________  
- 兑换合约地址: ________________
- NFT合约地址: ________________
- 部署区块高度: ________________
- 部署时间: ________________
