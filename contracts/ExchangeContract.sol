// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ExchangeContract
 * @dev YD代币兑换合约 - 支持 ETH ↔ YD 和 USDT ↔ YD 兑换
 * @author limuran
 */
contract ExchangeContract is Ownable, ReentrancyGuard {
    
    // 代币合约接口
    IERC20 public ydToken;
    IERC20 public usdtToken;
    
    // 兑换比例配置 (可调整)
    uint256 public ydToEthRate = 1000;      // 1000 YD = 1 ETH
    uint256 public ethToYdRate = 1000;      // 1 ETH = 1000 YD
    uint256 public ydToUsdtRate = 1;        // 1 YD = 1 USDT
    uint256 public usdtToYdRate = 1;        // 1 USDT = 1 YD
    uint256 public ethToUsdtRate = 3000;    // 1 ETH = 3000 USDT
    uint256 public usdtToEthRate = 3000;    // 3000 USDT = 1 ETH
    
    // 手续费配置
    uint256 public feePercentage = 3;           // 3% 手续费
    uint256 public constant FEE_DENOMINATOR = 100;
    
    // 储备池余额跟踪
    uint256 public ethReserve;
    uint256 public usdtReserve;
    uint256 public ydReserve;
    
    // 统计数据
    uint256 public totalFeeCollected;
    uint256 public totalEthExchanged;
    uint256 public totalUsdtExchanged;
    uint256 public totalYdExchanged;
    
    // 事件定义
    event EthToYdExchange(address indexed user, uint256 ethAmount, uint256 ydAmount, uint256 fee, uint256 timestamp);
    event YdToEthExchange(address indexed user, uint256 ydAmount, uint256 ethAmount, uint256 fee, uint256 timestamp);
    event UsdtToYdExchange(address indexed user, uint256 usdtAmount, uint256 ydAmount, uint256 fee, uint256 timestamp);
    event YdToUsdtExchange(address indexed user, uint256 ydAmount, uint256 usdtAmount, uint256 fee, uint256 timestamp);
    event EthToUsdtExchange(address indexed user, uint256 ethAmount, uint256 usdtAmount, uint256 fee, uint256 timestamp);
    event UsdtToEthExchange(address indexed user, uint256 usdtAmount, uint256 ethAmount, uint256 fee, uint256 timestamp);
    
    constructor(address _ydToken, address _usdtToken, address _initialOwner) Ownable(_initialOwner) {
        require(_ydToken != address(0), "Invalid YD token address");
        require(_usdtToken != address(0), "Invalid USDT token address");
        ydToken = IERC20(_ydToken);
        usdtToken = IERC20(_usdtToken);
    }
    
    receive() external payable {
        ethReserve += msg.value;
    }
    
    // ETH兑换YD代币
    function exchangeEthToYd() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        
        uint256 ydAmount = msg.value * ethToYdRate;
        uint256 fee = (ydAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netYdAmount = ydAmount - fee;
        
        require(ydToken.balanceOf(address(this)) >= netYdAmount, "Insufficient YD reserve");
        
        ethReserve += msg.value;
        ydReserve -= netYdAmount;
        totalFeeCollected += fee;
        totalEthExchanged += msg.value;
        
        require(ydToken.transfer(msg.sender, netYdAmount), "YD transfer failed");
        
        emit EthToYdExchange(msg.sender, msg.value, netYdAmount, fee, block.timestamp);
    }
    
    // YD代币兑换ETH
    function exchangeYdToEth(uint256 ydAmount) external nonReentrant {
        require(ydAmount > 0, "Invalid YD amount");
        require(ydToken.balanceOf(msg.sender) >= ydAmount, "Insufficient YD balance");
        require(ydToken.allowance(msg.sender, address(this)) >= ydAmount, "Insufficient allowance");
        
        uint256 ethAmount = ydAmount / ydToEthRate;
        uint256 fee = (ethAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netEthAmount = ethAmount - fee;
        
        require(address(this).balance >= netEthAmount, "Insufficient ETH reserve");
        
        require(ydToken.transferFrom(msg.sender, address(this), ydAmount), "YD transfer failed");
        
        ydReserve += ydAmount;
        ethReserve -= netEthAmount;
        totalFeeCollected += fee;
        totalYdExchanged += ydAmount;
        
        payable(msg.sender).transfer(netEthAmount);
        
        emit YdToEthExchange(msg.sender, ydAmount, netEthAmount, fee, block.timestamp);
    }
    
    // USDT兑换YD代币
    function exchangeUsdtToYd(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "Invalid USDT amount");
        require(usdtToken.balanceOf(msg.sender) >= usdtAmount, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= usdtAmount, "Insufficient allowance");
        
        uint256 ydAmount = usdtAmount * usdtToYdRate;
        uint256 fee = (ydAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netYdAmount = ydAmount - fee;
        
        require(ydToken.balanceOf(address(this)) >= netYdAmount, "Insufficient YD reserve");
        
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        usdtReserve += usdtAmount;
        ydReserve -= netYdAmount;
        totalFeeCollected += fee;
        totalUsdtExchanged += usdtAmount;
        
        require(ydToken.transfer(msg.sender, netYdAmount), "YD transfer failed");
        
        emit UsdtToYdExchange(msg.sender, usdtAmount, netYdAmount, fee, block.timestamp);
    }
    
    // YD代币兑换USDT
    function exchangeYdToUsdt(uint256 ydAmount) external nonReentrant {
        require(ydAmount > 0, "Invalid YD amount");
        require(ydToken.balanceOf(msg.sender) >= ydAmount, "Insufficient YD balance");
        require(ydToken.allowance(msg.sender, address(this)) >= ydAmount, "Insufficient allowance");
        
        uint256 usdtAmount = ydAmount * ydToUsdtRate;
        uint256 fee = (usdtAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netUsdtAmount = usdtAmount - fee;
        
        require(usdtToken.balanceOf(address(this)) >= netUsdtAmount, "Insufficient USDT reserve");
        
        require(ydToken.transferFrom(msg.sender, address(this), ydAmount), "YD transfer failed");
        
        ydReserve += ydAmount;
        usdtReserve -= netUsdtAmount;
        totalFeeCollected += fee;
        totalYdExchanged += ydAmount;
        
        require(usdtToken.transfer(msg.sender, netUsdtAmount), "USDT transfer failed");
        
        emit YdToUsdtExchange(msg.sender, ydAmount, netUsdtAmount, fee, block.timestamp);
    }
    
    // ETH兑换USDT (供作者使用)
    function exchangeEthToUsdt() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        
        uint256 usdtAmount = (msg.value * ethToUsdtRate) / 1 ether;
        uint256 fee = (usdtAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netUsdtAmount = usdtAmount - fee;
        
        require(usdtToken.balanceOf(address(this)) >= netUsdtAmount, "Insufficient USDT reserve");
        
        ethReserve += msg.value;
        usdtReserve -= netUsdtAmount;
        totalFeeCollected += fee;
        totalEthExchanged += msg.value;
        
        require(usdtToken.transfer(msg.sender, netUsdtAmount), "USDT transfer failed");
        
        emit EthToUsdtExchange(msg.sender, msg.value, netUsdtAmount, fee, block.timestamp);
    }
    
    // 管理函数
    function updateRates(
        uint256 _ethToYdRate,
        uint256 _ydToEthRate,
        uint256 _usdtToYdRate,
        uint256 _ydToUsdtRate,
        uint256 _ethToUsdtRate
    ) external onlyOwner {
        ethToYdRate = _ethToYdRate;
        ydToEthRate = _ydToEthRate;
        usdtToYdRate = _usdtToYdRate;
        ydToUsdtRate = _ydToUsdtRate;
        ethToUsdtRate = _ethToUsdtRate;
    }
    
    function updateFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 10, "Fee too high");
        feePercentage = _feePercentage;
    }
    
    function addLiquidity(uint256 ydAmount, uint256 usdtAmount) external payable onlyOwner {
        if (ydAmount > 0) {
            require(ydToken.transferFrom(msg.sender, address(this), ydAmount), "YD transfer failed");
            ydReserve += ydAmount;
        }
        if (usdtAmount > 0) {
            require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
            usdtReserve += usdtAmount;
        }
        if (msg.value > 0) {
            ethReserve += msg.value;
        }
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
