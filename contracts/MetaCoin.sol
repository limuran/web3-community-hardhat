// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaCoin - Enhanced Version
 * @dev 基于原始 MetaCoin 的增强版本，添加了更多实用功能
 * @author limuran
 */
contract MetaCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    
    // 保持原有的代币信息（可配置版本）
    string private _tokenName;
    string private _tokenSymbol;
    uint256 private _initialSupply;
    uint8 private _decimals;
    
    // 新增功能：最大供应量限制
    uint256 public immutable MAX_SUPPLY;
    
    // 新增功能：铸币权限管理
    mapping(address => bool) public minters;
    
    // 新增功能：黑名单管理
    mapping(address => bool) public blacklisted;
    
    // 事件定义
    event TokensPreMinted(address indexed to, uint256 amount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event AddressBlacklisted(address indexed account);
    event AddressRemovedFromBlacklist(address indexed account);
    
    /**
     * @dev 构造函数 - 保持原有风格但增加配置灵活性
     * @param tokenName_ 代币名称（默认："LueLueLueERC20Token"）
     * @param tokenSymbol_ 代币符号（默认："Lue"）
     * @param initialSupply_ 初始发行量（默认：10000）
     * @param decimals_ 小数位数（默认：0，保持原有设计）
     * @param maxSupply_ 最大供应量（0 表示无限制）
     * @param initialOwner 合约所有者
     */
    constructor(
        string memory tokenName_,
        string memory tokenSymbol_,
        uint256 initialSupply_,
        uint8 decimals_,
        uint256 maxSupply_,
        address initialOwner
    ) ERC20(tokenName_, tokenSymbol_) Ownable(initialOwner) {
        // 设置代币基本信息
        _tokenName = bytes(tokenName_).length > 0 ? tokenName_ : "LueLueLueERC20Token";
        _tokenSymbol = bytes(tokenSymbol_).length > 0 ? tokenSymbol_ : "Lue";
        _initialSupply = initialSupply_ > 0 ? initialSupply_ : 10000;
        _decimals = decimals_;
        
        // 设置最大供应量
        MAX_SUPPLY = maxSupply_ > 0 ? maxSupply_ : type(uint256).max;
        require(_initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        
        // 将初始发行量发送给合约所有者（保持原有逻辑）
        if (_initialSupply > 0) {
            _mint(initialOwner, _initialSupply * 10**_decimals);
            emit TokensPreMinted(initialOwner, _initialSupply * 10**_decimals);
        }
        
        // 设置部署者为初始铸币者
        minters[initialOwner] = true;
        emit MinterAdded(initialOwner);
    }
    
    /**
     * @dev 重写 decimals 函数（保持原有设计思路）
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev 获取代币基本信息
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply,
        uint256 maxSupply,
        uint256 initialSupply,
        uint8 tokenDecimals
    ) {
        return (
            _tokenName,
            _tokenSymbol,
            totalSupply(),
            MAX_SUPPLY,
            _initialSupply,
            _decimals
        );
    }
    
    // ==================== 新增功能：铸币管理 ====================
    
    /**
     * @dev 添加铸币者权限
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!minters[minter], "Already a minter");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev 移除铸币者权限
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev 铸造代币（仅限授权铸币者）
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Invalid recipient");
        require(!blacklisted[to], "Recipient is blacklisted");
        
        if (MAX_SUPPLY != type(uint256).max) {
            require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        }
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev 检查是否为铸币者
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }
    
    // ==================== 新增功能：暂停机制 ====================
    
    /**
     * @dev 暂停合约（紧急情况下使用）
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ==================== 新增功能：黑名单管理 ====================
    
    /**
     * @dev 添加地址到黑名单
     */
    function addToBlacklist(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!blacklisted[account], "Already blacklisted");
        
        blacklisted[account] = true;
        emit AddressBlacklisted(account);
    }
    
    /**
     * @dev 从黑名单中移除地址
     */
    function removeFromBlacklist(address account) external onlyOwner {
        require(blacklisted[account], "Not blacklisted");
        
        blacklisted[account] = false;
        emit AddressRemovedFromBlacklist(account);
    }
    
    /**
     * @dev 检查地址是否在黑名单中
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }
    
    // ==================== 新增功能：批量操作 ====================
    
    /**
     * @dev 批量转账
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(!blacklisted[recipients[i]], "Recipient is blacklisted");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev 批量铸币（仅限铸币者）
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 totalMintAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalMintAmount += amounts[i];
        }
        
        if (MAX_SUPPLY != type(uint256).max) {
            require(totalSupply() + totalMintAmount <= MAX_SUPPLY, "Would exceed max supply");
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(!blacklisted[recipients[i]], "Recipient is blacklisted");
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
    
    // ==================== 工具函数 ====================
    
    /**
     * @dev 获取剩余可铸造数量
     */
    function remainingMintableSupply() external view returns (uint256) {
        if (MAX_SUPPLY == type(uint256).max) {
            return type(uint256).max;
        }
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev 获取合约统计信息
     */
    function getStats() external view returns (
        uint256 currentSupply,
        uint256 maxSupply,
        uint256 remainingSupply,
        bool isPaused,
        address owner,
        uint256 holderBalance
    ) {
        uint256 remaining = MAX_SUPPLY == type(uint256).max ? type(uint256).max : MAX_SUPPLY - totalSupply();
        
        return (
            totalSupply(),
            MAX_SUPPLY,
            remaining,
            paused(),
            owner(),
            balanceOf(msg.sender)
        );
    }
    
    // ==================== 重写函数以支持多重继承 ====================
    
    /**
     * @dev 重写转账函数以支持黑名单和暂停功能
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        require(!blacklisted[from], "Sender is blacklisted");
        require(!blacklisted[to], "Recipient is blacklisted");
        
        super._update(from, to, value);
    }
    
    /**
     * @dev 紧急提取功能（仅限所有者，用于回收错误发送的其他代币）
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot withdraw own tokens");
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev 紧急提取 ETH（如果有的话）
     */
    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
