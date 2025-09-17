// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CourseNFT
 * @dev Web3大学课程完成证书NFT合约
 * @author limuran
 */
contract CourseNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // 授权的课程合约地址
    address public courseContract;
    
    // NFT证书信息
    struct Certificate {
        string courseId;
        address student;
        uint256 completionDate;
        string courseName;
        string instructorName;
        uint8 grade; // 成绩等级 A=5, B=4, C=3, D=2, F=1
        string metadataURI;
    }
    
    // NFT ID -> 证书信息
    mapping(uint256 => Certificate) public certificates;
    
    // 课程ID + 学生地址 -> NFT ID
    mapping(string => mapping(address => uint256)) public studentCertificates;
    
    // 学生地址 -> NFT ID数组
    mapping(address => uint256[]) public studentNFTs;
    
    // 课程ID -> 获得证书的学生数量
    mapping(string => uint256) public courseCertificateCount;
    
    // 统计数据
    uint256 public totalCertificatesIssued;
    mapping(string => uint256) public courseCompletionStats;
    
    // 事件定义
    event CertificateIssued(
        uint256 indexed tokenId,
        string indexed courseId,
        address indexed student,
        string courseName,
        uint8 grade,
        uint256 timestamp
    );
    
    event CourseContractUpdated(
        address indexed oldContract,
        address indexed newContract,
        uint256 timestamp
    );
    
    event MetadataUpdated(
        uint256 indexed tokenId,
        string newURI,
        uint256 timestamp
    );
    
    /**
     * @dev 构造函数
     * @param _courseContract 课程合约地址
     * @param _initialOwner 合约所有者
     */
    constructor(
        address _courseContract,
        address _initialOwner
    ) ERC721("Web3University Certificate", "W3UC") Ownable(_initialOwner) {
        require(_courseContract != address(0), "Invalid course contract address");
        courseContract = _courseContract;
    }
    
    /**
     * @dev 铸造课程完成证书NFT (仅限课程合约调用)
     * @param student 学生地址
     * @param courseId 课程ID
     * @param courseName 课程名称
     * @param instructorName 讲师名称
     * @param grade 成绩等级
     * @return tokenId 新铸造的NFT ID
     */
    function mintCertificate(
        address student,
        string memory courseId,
        string memory courseName,
        string memory instructorName,
        uint8 grade
    ) external returns (uint256) {
        require(msg.sender == courseContract, "Only course contract can mint");
        require(student != address(0), "Invalid student address");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        require(bytes(courseName).length > 0, "Course name cannot be empty");
        require(grade >= 1 && grade <= 5, "Invalid grade (1-5)");
        require(studentCertificates[courseId][student] == 0, "Certificate already exists");
        
        // 增加计数器
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 铸造NFT
        _mint(student, newTokenId);
        
        // 生成元数据URI
        string memory metadataURI = string(abi.encodePacked(
            "https://api.web3university.com/certificate/",
            toString(newTokenId),
            ".json"
        ));
        
        // 设置token URI
        _setTokenURI(newTokenId, metadataURI);
        
        // 存储证书信息
        certificates[newTokenId] = Certificate({
            courseId: courseId,
            student: student,
            completionDate: block.timestamp,
            courseName: courseName,
            instructorName: instructorName,
            grade: grade,
            metadataURI: metadataURI
        });
        
        // 更新映射关系
        studentCertificates[courseId][student] = newTokenId;
        studentNFTs[student].push(newTokenId);
        
        // 更新统计数据
        courseCertificateCount[courseId]++;
        totalCertificatesIssued++;
        courseCompletionStats[courseId]++;
        
        emit CertificateIssued(
            newTokenId,
            courseId,
            student,
            courseName,
            grade,
            block.timestamp
        );
        
        return newTokenId;
    }
    
    /**
     * @dev 批量铸造证书 (仅限课程合约)
     * @param students 学生地址数组
     * @param courseIds 课程ID数组
     * @param courseName 课程名称
     * @param instructorName 讲师名称
     * @param grades 成绩数组
     */
    function batchMintCertificates(
        address[] memory students,
        string[] memory courseIds,
        string memory courseName,
        string memory instructorName,
        uint8[] memory grades
    ) external {
        require(msg.sender == courseContract, "Only course contract can mint");
        require(students.length == courseIds.length, "Array lengths mismatch");
        require(students.length == grades.length, "Array lengths mismatch");
        require(students.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < students.length; i++) {
            // 检查是否已经有证书
            if (studentCertificates[courseIds[i]][students[i]] == 0) {
                mintCertificate(
                    students[i],
                    courseIds[i],
                    courseName,
                    instructorName,
                    grades[i]
                );
            }
        }
    }
    
    /**
     * @dev 获取学生的所有证书NFT
     * @param student 学生地址
     * @return tokenIds NFT ID数组
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentNFTs[student];
    }
    
    /**
     * @dev 获取证书详细信息
     * @param tokenId NFT ID
     * @return 证书信息结构
     */
    function getCertificateInfo(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @dev 检查学生是否有指定课程的证书
     * @param courseId 课程ID
     * @param student 学生地址
     * @return tokenId NFT ID (0表示没有)
     */
    function getStudentCertificateForCourse(
        string memory courseId,
        address student
    ) external view returns (uint256) {
        return studentCertificates[courseId][student];
    }
    
    /**
     * @dev 获取课程的证书统计信息
     * @param courseId 课程ID
     * @return certificateCount 证书数量
     */
    function getCourseCertificateStats(string memory courseId) external view returns (uint256) {
        return courseCertificateCount[courseId];
    }
    
    /**
     * @dev 获取学生证书统计
     * @param student 学生地址
     * @return totalCerts 总证书数量
     * @return avgGrade 平均成绩
     */
    function getStudentStats(address student) external view returns (
        uint256 totalCerts,
        uint256 avgGrade
    ) {
        uint256[] memory nfts = studentNFTs[student];
        totalCerts = nfts.length;
        
        if (totalCerts == 0) {
            return (0, 0);
        }
        
        uint256 totalGrade = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            totalGrade += certificates[nfts[i]].grade;
        }
        
        avgGrade = (totalGrade * 100) / totalCerts; // 保留2位小数
    }
    
    /**
     * @dev 更新课程合约地址 (仅限所有者)
     * @param _newCourseContract 新的课程合约地址
     */
    function updateCourseContract(address _newCourseContract) external onlyOwner {
        require(_newCourseContract != address(0), "Invalid address");
        
        address oldContract = courseContract;
        courseContract = _newCourseContract;
        
        emit CourseContractUpdated(oldContract, _newCourseContract, block.timestamp);
    }
    
    /**
     * @dev 更新NFT元数据URI (仅限所有者)
     * @param tokenId NFT ID
     * @param newURI 新的URI
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        _setTokenURI(tokenId, newURI);
        certificates[tokenId].metadataURI = newURI;
        
        emit MetadataUpdated(tokenId, newURI, block.timestamp);
    }
    
    /**
     * @dev 获取平台整体统计
     * @return totalIssued 总发行量
     * @return uniqueStudents 独特学生数 (需要通过事件查询)
     * @return activeCourses 活跃课程数 (需要通过事件查询)
     */
    function getPlatformStats() external view returns (
        uint256 totalIssued,
        uint256 uniqueStudents,
        uint256 activeCourses
    ) {
        totalIssued = totalCertificatesIssued;
        // uniqueStudents 和 activeCourses 需要通过The Graph或事件日志计算
        uniqueStudents = 0; // placeholder
        activeCourses = 0; // placeholder
    }
    
    /**
     * @dev 检查是否支持特定接口
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev 重写tokenURI函数
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev 重写_burn函数以支持URI存储
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev 禁止转移 (证书应该是灵魂绑定的)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0), "Certificates are soulbound and cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev 工具函数：将uint256转换为字符串
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
