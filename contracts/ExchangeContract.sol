// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ExchangeContract
 * @dev lue代币兑换合约 - 支持 ETH ↔ Lue 和 USDT ↔ Lue 兑换
 * @author limuran
 */
contract ExchangeContract is Ownable, ReentrancyGuard {
    // 代币合约接口
    IERC20 public lueToken;
    IERC20 public usdtToken;

    // 兑换比例配置 (可调整)
    uint256 public lueToEthRate = 1000; // 1000 Lue = 1 ETH
    uint256 public ethTolueRate = 1000; // 1 ETH = 1000 Lue
    uint256 public lueToUsdtRate = 1; // 1 Lue = 1 USDT
    uint256 public usdtTolueRate = 1; // 1 USDT = 1 Lue
    uint256 public ethToUsdtRate = 3000; // 1 ETH = 3000 USDT
    uint256 public usdtToEthRate = 3000; // 3000 USDT = 1 ETH

    // 手续费配置
    uint256 public feePercentage = 3; // 3% 手续费
    uint256 public constant FEE_DENOMINATOR = 100;

    // 储备池余额跟踪
    uint256 public ethReserve;
    uint256 public usdtReserve;
    uint256 public lueReserve;

    // 统计数据
    uint256 public totalFeeCollected;
    uint256 public totalEthExchanged;
    uint256 public totalUsdtExchanged;
    uint256 public totallueExchanged;

    // 事件定义
    event EthTolueExchange(
        address indexed user,
        uint256 ethAmount,
        uint256 lueAmount,
        uint256 fee,
        uint256 timestamp
    );
    event lueToEthExchange(
        address indexed user,
        uint256 lueAmount,
        uint256 ethAmount,
        uint256 fee,
        uint256 timestamp
    );
    event UsdtTolueExchange(
        address indexed user,
        uint256 usdtAmount,
        uint256 lueAmount,
        uint256 fee,
        uint256 timestamp
    );
    event lueToUsdtExchange(
        address indexed user,
        uint256 lueAmount,
        uint256 usdtAmount,
        uint256 fee,
        uint256 timestamp
    );
    event EthToUsdtExchange(
        address indexed user,
        uint256 ethAmount,
        uint256 usdtAmount,
        uint256 fee,
        uint256 timestamp
    );
    event UsdtToEthExchange(
        address indexed user,
        uint256 usdtAmount,
        uint256 ethAmount,
        uint256 fee,
        uint256 timestamp
    );

    constructor(
        address _lueToken,
        address _usdtToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_lueToken != address(0), "Invalid Lue token address");
        require(_usdtToken != address(0), "Invalid USDT token address");
        lueToken = IERC20(_lueToken);
        usdtToken = IERC20(_usdtToken);
    }

    receive() external payable {
        ethReserve += msg.value;
    }

    // ETH兑换lue代币
    function exchangeEthTolue() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");

        uint256 lueAmount = msg.value * ethTolueRate;
        uint256 fee = (lueAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netlueAmount = lueAmount - fee;

        require(
            lueToken.balanceOf(address(this)) >= netlueAmount,
            "Insufficient Lue reserve"
        );

        ethReserve += msg.value;
        lueReserve -= netlueAmount;
        totalFeeCollected += fee;
        totalEthExchanged += msg.value;

        require(
            lueToken.transfer(msg.sender, netlueAmount),
            "Lue transfer failed"
        );

        emit EthTolueExchange(
            msg.sender,
            msg.value,
            netlueAmount,
            fee,
            block.timestamp
        );
    }

    // lue代币兑换ETH
    function exchangelueToEth(uint256 lueAmount) external nonReentrant {
        require(lueAmount > 0, "Invalid Lue amount");
        require(
            lueToken.balanceOf(msg.sender) >= lueAmount,
            "Insufficient Lue balance"
        );
        require(
            lueToken.allowance(msg.sender, address(this)) >= lueAmount,
            "Insufficient allowance"
        );

        uint256 ethAmount = lueAmount / lueToEthRate;
        uint256 fee = (ethAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netEthAmount = ethAmount - fee;

        require(
            address(this).balance >= netEthAmount,
            "Insufficient ETH reserve"
        );

        require(
            lueToken.transferFrom(msg.sender, address(this), lueAmount),
            "Lue transfer failed"
        );

        lueReserve += lueAmount;
        ethReserve -= netEthAmount;
        totalFeeCollected += fee;
        totallueExchanged += lueAmount;

        payable(msg.sender).transfer(netEthAmount);

        emit lueToEthExchange(
            msg.sender,
            lueAmount,
            netEthAmount,
            fee,
            block.timestamp
        );
    }

    // USDT兑换lue代币
    function exchangeUsdtTolue(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "Invalid USDT amount");
        require(
            usdtToken.balanceOf(msg.sender) >= usdtAmount,
            "Insufficient USDT balance"
        );
        require(
            usdtToken.allowance(msg.sender, address(this)) >= usdtAmount,
            "Insufficient allowance"
        );

        uint256 lueAmount = usdtAmount * usdtTolueRate;
        uint256 fee = (lueAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netlueAmount = lueAmount - fee;

        require(
            lueToken.balanceOf(address(this)) >= netlueAmount,
            "Insufficient Lue reserve"
        );

        require(
            usdtToken.transferFrom(msg.sender, address(this), usdtAmount),
            "USDT transfer failed"
        );

        usdtReserve += usdtAmount;
        lueReserve -= netlueAmount;
        totalFeeCollected += fee;
        totalUsdtExchanged += usdtAmount;

        require(
            lueToken.transfer(msg.sender, netlueAmount),
            "Lue transfer failed"
        );

        emit UsdtTolueExchange(
            msg.sender,
            usdtAmount,
            netlueAmount,
            fee,
            block.timestamp
        );
    }

    // lue代币兑换USDT
    function exchangelueToUsdt(uint256 lueAmount) external nonReentrant {
        require(lueAmount > 0, "Invalid Lue amount");
        require(
            lueToken.balanceOf(msg.sender) >= lueAmount,
            "Insufficient Lue balance"
        );
        require(
            lueToken.allowance(msg.sender, address(this)) >= lueAmount,
            "Insufficient allowance"
        );

        uint256 usdtAmount = lueAmount * lueToUsdtRate;
        uint256 fee = (usdtAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netUsdtAmount = usdtAmount - fee;

        require(
            usdtToken.balanceOf(address(this)) >= netUsdtAmount,
            "Insufficient USDT reserve"
        );

        require(
            lueToken.transferFrom(msg.sender, address(this), lueAmount),
            "Lue transfer failed"
        );

        lueReserve += lueAmount;
        usdtReserve -= netUsdtAmount;
        totalFeeCollected += fee;
        totallueExchanged += lueAmount;

        require(
            usdtToken.transfer(msg.sender, netUsdtAmount),
            "USDT transfer failed"
        );

        emit lueToUsdtExchange(
            msg.sender,
            lueAmount,
            netUsdtAmount,
            fee,
            block.timestamp
        );
    }

    // ETH兑换USDT (供作者使用)
    function exchangeEthToUsdt() external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");

        uint256 usdtAmount = (msg.value * ethToUsdtRate) / 1 ether;
        uint256 fee = (usdtAmount * feePercentage) / FEE_DENOMINATOR;
        uint256 netUsdtAmount = usdtAmount - fee;

        require(
            usdtToken.balanceOf(address(this)) >= netUsdtAmount,
            "Insufficient USDT reserve"
        );

        ethReserve += msg.value;
        usdtReserve -= netUsdtAmount;
        totalFeeCollected += fee;
        totalEthExchanged += msg.value;

        require(
            usdtToken.transfer(msg.sender, netUsdtAmount),
            "USDT transfer failed"
        );

        emit EthToUsdtExchange(
            msg.sender,
            msg.value,
            netUsdtAmount,
            fee,
            block.timestamp
        );
    }

    // 管理函数
    function updateRates(
        uint256 _ethTolueRate,
        uint256 _lueToEthRate,
        uint256 _usdtTolueRate,
        uint256 _lueToUsdtRate,
        uint256 _ethToUsdtRate
    ) external onlyOwner {
        ethTolueRate = _ethTolueRate;
        lueToEthRate = _lueToEthRate;
        usdtTolueRate = _usdtTolueRate;
        lueToUsdtRate = _lueToUsdtRate;
        ethToUsdtRate = _ethToUsdtRate;
    }

    function updateFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 10, "Fee too high");
        feePercentage = _feePercentage;
    }

    function addLiquidity(
        uint256 lueAmount,
        uint256 usdtAmount
    ) external payable onlyOwner {
        if (lueAmount > 0) {
            require(
                lueToken.transferFrom(msg.sender, address(this), lueAmount),
                "Lue transfer failed"
            );
            lueReserve += lueAmount;
        }
        if (usdtAmount > 0) {
            require(
                usdtToken.transferFrom(msg.sender, address(this), usdtAmount),
                "USDT transfer failed"
            );
            usdtReserve += usdtAmount;
        }
        if (msg.value > 0) {
            ethReserve += msg.value;
        }
    }

    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
