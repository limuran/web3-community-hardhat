// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CourseContract
 * @dev Web3大学课程管理合约
 * @author limuran
 */
contract CourseContract is Ownable, ReentrancyGuard {
    
    // Lue币合约接口
    IERC20 public lueToken;
    
    // 核心数据结构
    // mapping(课程ID => mapping(用户地址 => bool)) 购买状态
    mapping(string => mapping(address => bool)) public coursePurchases;
    
    // 课程信息存储
    mapping(string => CourseInfo) public courses;
    
    // 课程创建者记录
    mapping(string => address) public courseCreators;
    
    // 用户创建的课程列表
    mapping(address => string[]) public userCourses;
    
    // 课程购买者列表
    mapping(string => address[]) public courseBuyers;
    
    // 平台收入记录
    uint256 public platformRevenue;
    uint256 public platformFeePercentage = 5; // 5% 平台手续费
    
    // 课程信息结构
    struct CourseInfo {
        string courseId;
        address creator;
        uint256 priceInLue;
        uint256 totalSales;
        uint256 purchaseCount;
        bool isActive;
        uint256 createdAt;
    }
    
    // 事件定义
    event CourseCreated(
        string indexed courseId, 
        address indexed creator, 
        uint256 priceInLue,
        uint256 timestamp
    );
    
    event CoursePurchased(
        string indexed courseId, 
        address indexed buyer, 
        address indexed creator,
        uint256 amount,
        uint256 platformFee,
        uint256 timestamp
    );
    
    event CourseStatusChanged(
        string indexed courseId,
        bool isActive,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    
    /**
     * @dev 构造函数
     * @param _lueTokenAddress Lue币合约地址
     * @param _initialOwner 合约所有者
     */
    constructor(address _lueTokenAddress, address _initialOwner) Ownable(_initialOwner) {
        require(_lueTokenAddress != address(0), "Invalid LUE token address");
        lueToken = IERC20(_lueTokenAddress);
    }
    
    /**
     * @dev 创建课程 (仅限所有者，可后续开放)
     * @param courseId 课程UUID (由Web2生成)
     * @param priceInLue 课程价格 (Lue币单位)
     */
    function createCourse(
        string memory courseId, 
        uint256 priceInLue
    ) external onlyOwner {
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        require(priceInLue > 0, "Price must be greater than 0");
        require(courses[courseId].creator == address(0), "Course already exists");
        
        // 创建课程信息
        courses[courseId] = CourseInfo({
            courseId: courseId,
            creator: msg.sender,
            priceInLue: priceInLue,
            totalSales: 0,
            purchaseCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // 记录创建者
        courseCreators[courseId] = msg.sender;
        
        // 添加到创建者课程列表
        userCourses[msg.sender].push(courseId);
        
        // 标记创建者为已购买 (创建者可查看自己的课程)
        coursePurchases[courseId][msg.sender] = true;
        courseBuyers[courseId].push(msg.sender);
        
        emit CourseCreated(courseId, msg.sender, priceInLue, block.timestamp);
    }
    
    /**
     * @dev 购买课程
     * @param courseId 课程ID
     */
    function purchaseCourse(string memory courseId) external nonReentrant {
        require(bytes(courseId).length > 0, "Invalid course ID");
        require(courses[courseId].creator != address(0), "Course does not exist");
        require(courses[courseId].isActive, "Course is not active");
        require(!coursePurchases[courseId][msg.sender], "Already purchased");
        require(msg.sender != courses[courseId].creator, "Creator cannot purchase own course");
        
        uint256 price = courses[courseId].priceInLue;
        require(lueToken.balanceOf(msg.sender) >= price, "Insufficient LUE balance");
        require(lueToken.allowance(msg.sender, address(this)) >= price, "Insufficient allowance");
        
        // 计算平台手续费
        uint256 platformFee = (price * platformFeePercentage) / 100;
        uint256 creatorAmount = price - platformFee;
        
        // 转账给创建者
        require(
            lueToken.transferFrom(msg.sender, courses[courseId].creator, creatorAmount),
            "Transfer to creator failed"
        );
        
        // 平台手续费转给合约所有者
        if (platformFee > 0) {
            require(
                lueToken.transferFrom(msg.sender, owner(), platformFee),
                "Platform fee transfer failed"
            );
            platformRevenue += platformFee;
        }
        
        // 更新购买状态
        coursePurchases[courseId][msg.sender] = true;
        courseBuyers[courseId].push(msg.sender);
        
        // 更新课程统计
        courses[courseId].totalSales += price;
        courses[courseId].purchaseCount += 1;
        
        emit CoursePurchased(
            courseId, 
            msg.sender, 
            courses[courseId].creator,
            price,
            platformFee,
            block.timestamp
        );
    }
    
    /**
     * @dev 检查用户是否已购买课程
     * @param courseId 课程ID
     * @param user 用户地址
     * @return 是否已购买
     */
    function hasPurchased(string memory courseId, address user) external view returns (bool) {
        return coursePurchases[courseId][user];
    }
    
    /**
     * @dev 获取课程详细信息
     * @param courseId 课程ID
     * @return 课程信息结构
     */
    function getCourseInfo(string memory courseId) external view returns (CourseInfo memory) {
        require(courses[courseId].creator != address(0), "Course does not exist");
        return courses[courseId];
    }
    
    /**
     * @dev 获取用户创建的所有课程
     * @param creator 创建者地址
     * @return 课程ID数组
     */
    function getUserCourses(address creator) external view returns (string[] memory) {
        return userCourses[creator];
    }
    
    /**
     * @dev 获取课程的所有购买者
     * @param courseId 课程ID
     * @return 购买者地址数组
     */
    function getCourseBuyers(string memory courseId) external view returns (address[] memory) {
        return courseBuyers[courseId];
    }
    
    /**
     * @dev 获取用户购买的课程统计
     * @param user 用户地址
     * @return purchasedCount 购买的课程数量
     */
    function getUserPurchaseStats(address user) external view returns (uint256 purchasedCount) {
        // 注: 由于无法高效遍历所有课程，建议通过The Graph查询
        // 这里提供基础统计功能
        purchasedCount = 0;
        // 实际实现需要通过事件日志或The Graph查询
    }
    
    /**
     * @dev 更新课程状态 (仅限创建者或所有者)
     * @param courseId 课程ID
     * @param isActive 是否激活
     */
    function updateCourseStatus(string memory courseId, bool isActive) external {
        require(courses[courseId].creator != address(0), "Course does not exist");
        require(
            msg.sender == courses[courseId].creator || msg.sender == owner(),
            "Not authorized"
        );
        
        courses[courseId].isActive = isActive;
        
        emit CourseStatusChanged(courseId, isActive, block.timestamp);
    }
    
    /**
     * @dev 更新平台手续费 (仅限所有者)
     * @param newFeePercentage 新的手续费百分比
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 20, "Fee cannot exceed 20%");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage, block.timestamp);
    }
    
    /**
     * @dev 批量创建课程 (仅限所有者)
     * @param courseIds 课程ID数组
     * @param prices 价格数组
     */
    function batchCreateCourses(
        string[] memory courseIds,
        uint256[] memory prices
    ) external onlyOwner {
        require(courseIds.length == prices.length, "Arrays length mismatch");
        require(courseIds.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < courseIds.length; i++) {
            // 重用 createCourse 逻辑，但不使用 onlyOwner 修饰符
            require(bytes(courseIds[i]).length > 0, "Course ID cannot be empty");
            require(prices[i] > 0, "Price must be greater than 0");
            require(courses[courseIds[i]].creator == address(0), "Course already exists");
            
            courses[courseIds[i]] = CourseInfo({
                courseId: courseIds[i],
                creator: msg.sender,
                priceInLue: prices[i],
                totalSales: 0,
                purchaseCount: 0,
                isActive: true,
                createdAt: block.timestamp
            });
            
            courseCreators[courseIds[i]] = msg.sender;
            userCourses[msg.sender].push(courseIds[i]);
            coursePurchases[courseIds[i]][msg.sender] = true;
            courseBuyers[courseIds[i]].push(msg.sender);
            
            emit CourseCreated(courseIds[i], msg.sender, prices[i], block.timestamp);
        }
    }
    
    /**
     * @dev 紧急暂停课程购买 (仅限所有者)
     * @param courseId 课程ID
     */
    function emergencyPauseCourse(string memory courseId) external onlyOwner {
        require(courses[courseId].creator != address(0), "Course does not exist");
        courses[courseId].isActive = false;
        emit CourseStatusChanged(courseId, false, block.timestamp);
    }
    
    /**
     * @dev 获取平台统计信息
     * @return totalRevenue 平台总收入
     * @return feePercentage 当前手续费比例
     */
    function getPlatformStats() external view returns (
        uint256 totalRevenue,
        uint256 feePercentage
    ) {
        return (platformRevenue, platformFeePercentage);
    }
    
    /**
     * @dev 紧急提取 (仅限所有者)
     * @param token 代币地址
     * @param amount 提取数量
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).transfer(owner(), amount);
    }
}
