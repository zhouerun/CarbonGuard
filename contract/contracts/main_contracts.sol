// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCarbonCredit is ERC1155, Ownable {
    // ====== 新增：收费相关变量 ======
    address public feeRecipient;

    uint256 public initFeePerProject;   // 项目创建费 (单位: wei)
    uint256 public mintFeePerCredit;    // 每个 credit 铸造费
    uint256 public retireFeePerCredit;  // 每个 credit 注销费
    uint256 public totalFeeRevenue;     // 累计收费总额

    
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
        feeRecipient = msg.sender; // 默认平台收款账户为部署者
    }

    // 设置审计员（仅管理员）
    function setAuditor(address _auditor) external onlyOwner {
        auditor = _auditor;
    }
    
    // 项目创建 - 项目所有者调用（现在是 payable）
    function createProject(
        string memory projectId,
        string memory projectType,
        string memory location,
        string memory tokenURI
    ) external payable returns (uint256) {
        // ====== 新增：收初始化费 ======
        _collectFee(initFeePerProject);

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
    
    // 铸造代币 - 仅项目所有者调用，仅限已验证项目（现在 payable）
    function mintCarbonCredit(
        uint256 tokenId,
        address to,
        uint256 amount
    ) external payable onlyProjectOwner(tokenId) onlyVerifiedProject(tokenId) {
        require(amount > 0, "Amount must be positive");
        require(
            projects[tokenId].mintedCredits + amount <= projects[tokenId].verifiedCredits,
            "Exceeds verified credits"
        );

        // ====== 新增：收铸造费 ======
        uint256 fee = mintFeePerCredit * amount;
        _collectFee(fee);

        projects[tokenId].mintedCredits += amount;
        _mint(to, tokenId, amount, "");

        emit CarbonCreditMinted(tokenId, to, amount);
    }

    
    // 退休代币 - 任何代币持有者调用（现在 payable）
    function retireCarbonCredit(
        uint256 tokenId,
        uint256 amount,
        string memory purpose
    ) external payable {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be positive");

        // ====== 新增：收注销费 ======
        uint256 fee = retireFeePerCredit * amount;
        _collectFee(fee);

        _burn(msg.sender, tokenId, amount);
        projects[tokenId].retiredCredits += amount;

        emit CarbonCreditRetired(tokenId, msg.sender, amount, purpose);
    }


    // 仅管理员修改收费配置
    function setFees(
        uint256 _initFeePerProject,
        uint256 _mintFeePerCredit,
        uint256 _retireFeePerCredit
    ) external onlyOwner {
        initFeePerProject = _initFeePerProject;
        mintFeePerCredit = _mintFeePerCredit;
        retireFeePerCredit = _retireFeePerCredit;
    }

    // 修改收费接收地址
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "invalid feeRecipient");
        feeRecipient = _feeRecipient;
    }

    function _collectFee(uint256 requiredFee) internal {
        require(msg.value >= requiredFee, "Insufficient fee sent");

        // 1) 把 fee 转给平台
        if (requiredFee > 0) {
            (bool ok1, ) = feeRecipient.call{value: requiredFee}("");
            require(ok1, "Fee transfer failed");
        }

        // 2) 退回多余费用
        uint256 refund = msg.value - requiredFee;
        if (refund > 0) {
            (bool ok2, ) = msg.sender.call{value: refund}("");
            require(ok2, "Refund failed");
        }

        // 3) 更新累计收费总额
        totalFeeRevenue += requiredFee;
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

    // 获取项目数量
    function getTotalProjects() external view returns (uint256) {
        return _nextTokenId - 1;
    }

}