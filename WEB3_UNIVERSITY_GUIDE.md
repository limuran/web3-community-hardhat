# 🎓 Web3大学完整部署指南

## 🎯 项目概述

Web3大学是一个基于区块链的去中心化教育平台，包含完整的代币经济系统、课程管理、NFT证书和DeFi质押功能。

### 核心功能
- 🪙 **YD代币系统** - 平台通用代币，支持分配策略
- 📚 **课程管理** - 创建、购买、学习课程
- 💱 **代币兑换** - YD ↔ ETH ↔ USDT 兑换
- 🏆 **NFT证书** - 学习完成后获得灵魂绑定证书
- 📊 **数据索引** - The Graph + API 混合数据架构
- 🔐 **MetaMask认证** - 去中心化身份验证

### 代币分配策略
```
总供应量: 1,000,000,000 YD
├── 团队锁仓: 20% (200,000,000 YD)
├── 投资人: 15% (150,000,000 YD)  
├── 学员空投&奖励: 30% (300,000,000 YD)
├── 生态激励: 25% (250,000,000 YD)
└── 流动性池: 10% (100,000,000 YD)
```

## 🚀 快速部署

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/limuran/web3-community-hardhat.git
cd web3-community-hardhat

# 安装依赖
npm install

# 配置环境变量
cp .env.sepolia .env
# 编辑 .env 文件，填入你的配置
```

### 2. 环境变量配置

```env
# Sepolia 测试网配置
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 一键部署所有合约

```bash
# 编译合约
npm run contracts:compile

# 部署到 Sepolia 测试网
npm run web3university:deploy

# 或使用 Hardhat Ignition 部署
npm run ignition:deploy:web3university
```

## 📋 合约详细说明

### 1. YD代币合约 (MetaCoin增强版)

**功能特性:**
- ✅ ERC20标准代币
- ✅ 铸币权限管理
- ✅ 代币燃烧机制
- ✅ 暂停功能
- ✅ 黑名单管理
- ✅ 批量操作
- ✅ 最大供应量限制

**关键函数:**
```solidity
// 基础查询
function getTokenInfo() external view returns (string memory name, string memory symbol, ...);
function getStats() external view returns (uint256 currentSupply, uint256 maxSupply, ...);

// 铸币管理
function addMinter(address minter) external onlyOwner;
function mint(address to, uint256 amount) external;

// 批量操作
function batchTransfer(address[] recipients, uint256[] amounts) external;
```

### 2. 课程合约 (CourseContract)

**核心映射:**
```solidity
mapping(string => mapping(address => bool)) public coursePurchases; // 课程ID -> 用户 -> 是否购买
mapping(string => CourseInfo) public courses; // 课程信息
mapping(address => string[]) public userCourses; // 用户创建的课程
```

**关键功能:**
- 🎓 创建课程 (仅限所有者)
- 💰 购买课程 (YD代币支付)
- 📊 平台手续费收取 (5%)
- 🔍 购买状态查询

### 3. 兑换合约 (ExchangeContract)

**支持兑换对:**
- 🔄 ETH ↔ YD
- 🔄 YD ↔ USDT  
- 🔄 ETH ↔ USDT

**兑换比例 (可调整):**
```solidity
uint256 public ethToYdRate = 1000;  // 1 ETH = 1000 YD
uint256 public ydToEthRate = 1000;  // 1000 YD = 1 ETH
uint256 public feePercentage = 3;   // 3% 手续费
```

### 4. NFT证书合约 (CourseNFT)

**特殊设计:**
- 🔒 **灵魂绑定** - 证书不可转移
- 📊 **成绩等级** - A(5) B(4) C(3) D(2) F(1)
- 🏆 **完整记录** - 课程信息、完成时间、成绩

## 💡 使用流程示例

### 学员购买课程流程

```javascript
// 1. 获取课程信息
const courseInfo = await courseContract.getCourseInfo(courseId);
const price = courseInfo.priceInYD;

// 2. 检查YD余额
const balance = await ydToken.balanceOf(userAddress);
if (balance < price) {
    // 需要先购买YD代币
    await exchangeContract.exchangeEthToYd({ value: ethers.parseEther("0.1") });
}

// 3. 授权YD代币给课程合约
await ydToken.approve(courseContract.address, price);

// 4. 购买课程
await courseContract.purchaseCourse(courseId);

// 5. 验证购买状态
const hasPurchased = await courseContract.hasPurchased(courseId, userAddress);
console.log("购买成功:", hasPurchased);
```

### 作者收益兑换流程

```javascript
// 1. 查看YD余额
const ydBalance = await ydToken.balanceOf(authorAddress);

// 2. YD 兑换 ETH
await ydToken.approve(exchangeContract.address, ydBalance);
await exchangeContract.exchangeYdToEth(ydBalance);

// 3. ETH 兑换 USDT (供AAVE质押)
await exchangeContract.exchangeEthToUsdt({ value: ethAmount });

// 4. 质押到AAVE (需要单独的质押合约)
// await stakingContract.stakeUSDT(usdtAmount);
```

### 学习完成获得NFT

```javascript
// 1. 学员完成课程学习 (链下验证)
// 2. 调用课程合约标记完成
await courseContract.completeCourse(courseId);

// 3. 自动铸造NFT证书
// 事件: CertificateIssued(tokenId, courseId, student, courseName, grade)

// 4. 查看获得的NFT
const certificates = await courseNFT.getStudentCertificates(studentAddress);
```

## 📊 数据查询架构

### RPC直连查询 (实时准确)
```javascript
// 钱包余额
const balance = await ydToken.balanceOf(userAddress);

// 授权状态
const allowance = await ydToken.allowance(userAddress, spenderAddress);

// 购买状态
const hasPurchased = await courseContract.hasPurchased(courseId, userAddress);
```

### The Graph查询 (复杂聚合)
```graphql
# 用户交易历史
query GetUserTransactions($userAddress: String!) {
    coursePurchases(where: { buyer: $userAddress }) {
        id
        courseId
        amount
        timestamp
        creator
    }
    
    certificateIssueds(where: { student: $userAddress }) {
        id
        courseId
        courseName
        grade
        timestamp
    }
}
```

### API查询 (业务逻辑)
```javascript
// 课程列表 (含购买状态)
GET /api/courses?category=blockchain&sort=popular&userAddress=0x123...

// 用户统计
GET /api/users/{address}/stats

// 课程详情 (含权限验证)
GET /api/courses/{courseId}/details?userAddress=0x123...
```

## 🔧 验证合约

部署成功后验证所有合约：

```bash
# YD代币合约
npx hardhat verify --network sepolia YD_TOKEN_ADDRESS "YDToken" "YD" 10000 0 1000000000 "OWNER_ADDRESS"

# 课程合约
npx hardhat verify --network sepolia COURSE_CONTRACT_ADDRESS "YD_TOKEN_ADDRESS" "OWNER_ADDRESS"

# 兑换合约
npx hardhat verify --network sepolia EXCHANGE_CONTRACT_ADDRESS "YD_TOKEN_ADDRESS" "USDT_ADDRESS" "OWNER_ADDRESS"

# NFT证书合约
npx hardhat verify --network sepolia COURSE_NFT_ADDRESS "COURSE_CONTRACT_ADDRESS" "OWNER_ADDRESS"
```

## 🧪 测试合约功能

```bash
# 运行所有测试
npm run web3university:test

# 生成测试覆盖率报告
npm run web3university:coverage

# 进入控制台测试
npm run sepolia:console
```

控制台测试示例：
```javascript
// 连接已部署的合约
const ydToken = await ethers.getContractAt("MetaCoin", "YD_TOKEN_ADDRESS");
const courseContract = await ethers.getContractAt("CourseContract", "COURSE_CONTRACT_ADDRESS");

// 查看代币状态
const tokenInfo = await ydToken.getTokenInfo();
console.log("代币信息:", tokenInfo);

// 查看平台统计
const platformStats = await courseContract.getPlatformStats();
console.log("平台统计:", platformStats);
```

## 📱 前端集成

### 合约地址配置
```typescript
// contracts/config.ts
export const CONTRACT_ADDRESSES = {
  YD_TOKEN: "0x...",
  COURSE_CONTRACT: "0x...",
  EXCHANGE_CONTRACT: "0x...",
  COURSE_NFT: "0x..."
};

export const CONTRACT_ABIS = {
  YD_TOKEN: require('./abis/MetaCoin.json'),
  COURSE_CONTRACT: require('./abis/CourseContract.json'),
  EXCHANGE_CONTRACT: require('./abis/ExchangeContract.json'),
  COURSE_NFT: require('./abis/CourseNFT.json')
};
```

### Web3连接示例
```typescript
// hooks/useContracts.ts
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts/config';

export function useContracts() {
  const { provider, signer } = useWallet();
  
  const contracts = useMemo(() => {
    if (!signer) return null;
    
    return {
      ydToken: new ethers.Contract(
        CONTRACT_ADDRESSES.YD_TOKEN,
        CONTRACT_ABIS.YD_TOKEN,
        signer
      ),
      courseContract: new ethers.Contract(
        CONTRACT_ADDRESSES.COURSE_CONTRACT,
        CONTRACT_ABIS.COURSE_CONTRACT,
        signer
      ),
      exchangeContract: new ethers.Contract(
        CONTRACT_ADDRESSES.EXCHANGE_CONTRACT,
        CONTRACT_ABIS.EXCHANGE_CONTRACT,
        signer
      ),
      courseNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.COURSE_NFT,
        CONTRACT_ABIS.COURSE_NFT,
        signer
      )
    };
  }, [signer]);
  
  return contracts;
}
```

## 🎯 完整业务流程

### 1. 平台初始化
```bash
# 1. 部署所有合约
npm run web3university:deploy

# 2. 配置代币分配
# 手动转账到各个分配钱包

# 3. 设置兑换池流动性
# 向兑换合约充值ETH和USDT

# 4. 创建示例课程
# 调用课程合约创建几门示例课程
```

### 2. 用户使用流程
```
用户访问平台 → 连接MetaMask → 浏览课程列表 → 购买YD代币 → 
授权+购买课程 → 学习课程内容 → 完成课程 → 获得NFT证书
```

### 3. 作者使用流程
```
作者申请 → 创建课程 → 设置价格 → 等待学员购买 → 
获得YD收益 → 兑换为ETH/USDT → 质押AAVE理财
```

## 🔒 安全注意事项

### 合约安全
- ✅ 使用OpenZeppelin标准库
- ✅ ReentrancyGuard防重入攻击
- ✅ Ownable权限管理
- ✅ Pausable紧急暂停
- ✅ 输入参数验证

### 部署安全
- ⚠️ 私钥安全保管
- ⚠️ 测试网充分验证
- ⚠️ 合约验证公开源码
- ⚠️ 多签钱包管理资金

### 运营安全
- 📊 监控合约调用异常
- 📊 设置交易金额上限
- 📊 定期安全审计
- 📊 用户资金保护机制

## 📈 扩展功能

### The Graph集成
```yaml
# subgraph.yaml
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: YDToken
    network: sepolia
    source:
      address: "YD_TOKEN_ADDRESS"
      abi: MetaCoin
      startBlock: DEPLOY_BLOCK
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      file: ./src/mapping.ts
      entities:
        - Transfer
        - Approval
      abis:
        - name: MetaCoin
          file: ./abis/MetaCoin.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
```

### AAVE质押集成
```solidity
// AAVEStaking.sol
contract AAVEStaking {
    IPool public aavePool = IPool(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951); // Sepolia
    
    function stakeUSDT(uint256 amount) external {
        IERC20(USDT).transferFrom(msg.sender, address(this), amount);
        IERC20(USDT).approve(address(aavePool), amount);
        
        aavePool.supply(USDT, amount, msg.sender, 0);
    }
}
```

## 🎉 总结

你现在拥有一个完整的Web3大学教育平台：

✅ **4个核心合约**: YD代币、课程管理、代币兑换、NFT证书
✅ **完整代币经济**: 分配策略、铸币燃烧、兑换机制  
✅ **数据架构**: RPC + The Graph + API 混合方案
✅ **安全机制**: 权限管理、重入防护、暂停功能
✅ **扩展性**: 支持AAVE质押、多链部署

### 快速开始命令
```bash
# 一键部署
npm install && npm run contracts:compile && npm run web3university:deploy

# 验证合约 (使用脚本输出的命令)
npx hardhat verify --network sepolia ...

# 开始构建前端
npm run dev
```

🚀 **现在就开始构建你的Web3教育帝国吧！**
