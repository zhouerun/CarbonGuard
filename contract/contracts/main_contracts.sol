// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCarbonCredit is ERC1155, Ownable {
    
    // 角色定义
    address public auditor; // 审计员地址
    
    // 项目状态
    enum ProjectStatus { Created, Verified, Rejected }
    
    // 项目信息
    struct Project {
        uint256 tokenId;
        address projectOwner;
        string projectId;
        string projectType;
        string location;
        uint256 verifiedCredits; // 审计员验证的碳信用数量
        ProjectStatus status;
        uint256 mintedCredits;
        uint256 retiredCredits;
    }
    
    // 状态变量
    mapping(uint256 => Project) public projects;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _nextTokenId = 1;
    
    // 事件
    event ProjectCreated(uint256 indexed tokenId, address indexed projectOwner, string projectId);
    event ProjectVerified(uint256 indexed tokenId, address indexed auditor, uint256 credits);
    event CarbonCreditMinted(uint256 indexed tokenId, address indexed to, uint256 amount);
    event CarbonCreditRetired(uint256 indexed tokenId, address indexed retirer, uint256 amount, string purpose);
    
    // 修饰器
    modifier onlyAuditor() {
        require(msg.sender == auditor, "Only auditor can call this function");
        _;
    }
    
    modifier onlyProjectOwner(uint256 tokenId) {
        require(projects[tokenId].projectOwner == msg.sender, "Only project owner can call this function");
        _;
    }
    
    modifier onlyVerifiedProject(uint256 tokenId) {
        require(projects[tokenId].status == ProjectStatus.Verified, "Project must be verified");
        _;
    }
    
    // 构造函数
    constructor(string memory _uri) ERC1155(_uri) Ownable(msg.sender) {
        auditor = msg.sender; // 部署者默认为审计员
    }

    // 设置审计员（仅管理员）
    function setAuditor(address _auditor) external onlyOwner {
        auditor = _auditor;
    }
    
    // 项目创建 - 项目所有者调用
    function createProject(
        string memory projectId,
        string memory projectType,
        string memory location,
        string memory tokenURI
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        projects[tokenId] = Project({
            tokenId: tokenId,
            projectOwner: msg.sender,
            projectId: projectId,
            projectType: projectType,
            location: location,
            verifiedCredits: 0,
            status: ProjectStatus.Created,
            mintedCredits: 0,
            retiredCredits: 0
        });
        
        _tokenURIs[tokenId] = tokenURI;
        
        emit ProjectCreated(tokenId, msg.sender, projectId);
        
        return tokenId;
    }
    
    // 项目验证 - 仅审计员调用
    function verifyProject(uint256 tokenId, uint256 verifiedCredits) external onlyAuditor {
        require(projects[tokenId].status == ProjectStatus.Created, "Project must be in Created status");
        require(verifiedCredits > 0, "Verified credits must be positive");
        
        projects[tokenId].verifiedCredits = verifiedCredits;
        projects[tokenId].status = ProjectStatus.Verified;
        
        emit ProjectVerified(tokenId, msg.sender, verifiedCredits);
    }
    
    // 铸造代币 - 仅项目所有者调用，仅限已验证项目
    function mintCarbonCredit(
        uint256 tokenId,
        address to,
        uint256 amount
    ) external onlyProjectOwner(tokenId) onlyVerifiedProject(tokenId) {
        require(amount > 0, "Amount must be positive");
        require(projects[tokenId].mintedCredits + amount <= projects[tokenId].verifiedCredits, 
                "Exceeds verified credits");
        
        projects[tokenId].mintedCredits += amount;
        _mint(to, tokenId, amount, "");
        
        emit CarbonCreditMinted(tokenId, to, amount);
    }
    
    // 退休代币 - 任何代币持有者调用
    function retireCarbonCredit(
        uint256 tokenId,
        uint256 amount,
        string memory purpose
    ) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be positive");
        
        _burn(msg.sender, tokenId, amount);
        projects[tokenId].retiredCredits += amount;
        
        emit CarbonCreditRetired(tokenId, msg.sender, amount, purpose);
    }
    
    // 获取项目信息
    function getProjectInfo(uint256 tokenId) external view returns (Project memory) {
        return projects[tokenId];
    }
    
    // 获取代币URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
    
    // 获取活跃代币数量
    function getActiveCredits(uint256 tokenId) external view returns (uint256) {
        return projects[tokenId].mintedCredits - projects[tokenId].retiredCredits;
    }
}