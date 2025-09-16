// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title Web3CommunityToken
 * @dev 增强版的 ERC20 代币合约，支持燃烧、暂停、许可等功能
 */
contract Web3CommunityToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    // 代币基本信息
    string private constant TOKEN_NAME = "Web3 Community Token";
    string private constant TOKEN_SYMBOL = "W3CT";
    
    // 代币总供应量 (带18位小数)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 10亿代币
    
    // 铸币权限控制
    mapping(address => bool) public minters;
    
    // 事件定义
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    
    /**
     * @dev 构造函数
     * @param initialOwner 合约初始所有者
     * @param initialSupply 初始发行量
     */
    constructor(
        address initialOwner,
        uint256 initialSupply
    ) 
        ERC20(TOKEN_NAME, TOKEN_SYMBOL) 
        ERC20Permit(TOKEN_NAME)
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "Invalid owner address");
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        
        // 初始代币分配给所有者
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
            emit TokensMinted(initialOwner, initialSupply);
        }
        
        // 设置初始所有者为铸币者
        minters[initialOwner] = true;
        emit MinterAdded(initialOwner);
    }
    
    /**
     * @dev 添加铸币权限
     * @param minter 新的铸币者地址
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!minters[minter], "Already a minter");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev 移除铸币权限
     * @param minter 要移除的铸币者地址
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev 铸造代币（仅限授权的铸币者）
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Invalid recipient address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev 暂停合约（仅限所有者）
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约（仅限所有者）
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 批量转账
     * @param recipients 接收者地址数组
     * @param amounts 转账金额数组
     */
    function batchTransfer(
        address[] calldata recipients, 
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev 检查是否为铸币者
     * @param account 要检查的地址
     * @return 是否为铸币者
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }
    
    /**
     * @dev 获取剩余可铸造数量
     * @return 剩余可铸造的代币数量
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    // 重写父合约函数以处理多重继承
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
