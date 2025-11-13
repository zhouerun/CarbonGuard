class CarbonCreditApp {
    constructor() {
        this.currentTab = 'project';
        this.init();
    }

    // 初始化应用
    init() {
        this.setupEventListeners();
        this.setupTabNavigation();
        console.log('CarbonCredit DApp 初始化完成');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 钱包连接
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
        });

        // 表单提交
        document.getElementById('createProjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateProject();
        });

        document.getElementById('verifyProjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVerifyProject();
        });

        document.getElementById('mintForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMintTokens();
        });

        document.getElementById('retireForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRetireTokens();
        });

        document.getElementById('queryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQueryProject();
        });

        document.getElementById('balanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQueryBalance();
        });
    }

    // 设置标签页导航
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新按钮状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    // 连接钱包
    async connectWallet() {
        const connectButton = document.getElementById('connectWallet');
        const originalText = connectButton.textContent;
        
        connectButton.innerHTML = '<span class="loading"></span>连接中...';
        connectButton.disabled = true;

        try {
            await wallet.connectWallet();
            await contractManager.initContract();
        } catch (error) {
            console.error('连接失败:', error);
        } finally {
            connectButton.textContent = originalText;
            connectButton.disabled = false;
        }
    }

    // 处理创建项目
    async handleCreateProject() {
        if (!this.validateWalletConnection()) return;

        const projectId = document.getElementById('projectId').value;
        const projectType = document.getElementById('projectType').value;
        const location = document.getElementById('location').value;
        const tokenURI = document.getElementById('tokenURI').value;

        try {
            await contractManager.createProject(projectId, projectType, location, tokenURI);
            // 清空表单
            document.getElementById('createProjectForm').reset();
        } catch (error) {
            // 错误已经在 contractManager 中处理
        }
    }

    // 处理验证项目
    async handleVerifyProject() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('verifyTokenId').value;
        const verifiedCredits = document.getElementById('verifiedCredits').value;

        try {
            await contractManager.verifyProject(tokenId, verifiedCredits);
            document.getElementById('verifyProjectForm').reset();
        } catch (error) {
            // 错误已经在 contractManager 中处理
        }
    }

    // 处理铸造代币
    async handleMintTokens() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('mintTokenId').value;
        const to = document.getElementById('mintTo').value;
        const amount = document.getElementById('mintAmount').value;

        try {
            await contractManager.mintCarbonCredit(tokenId, to, amount);
            document.getElementById('mintForm').reset();
        } catch (error) {
            // 错误已经在 contractManager 中处理
        }
    }

    // 处理退休代币
    async handleRetireTokens() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('retireTokenId').value;
        const amount = document.getElementById('retireAmount').value;
        const purpose = document.getElementById('retirePurpose').value;

        try {
            await contractManager.retireCarbonCredit(tokenId, amount, purpose);
            document.getElementById('retireForm').reset();
        } catch (error) {
            // 错误已经在 contractManager 中处理
        }
    }

    // 处理查询项目
    async handleQueryProject() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('queryTokenId').value;

        try {
            const projectInfo = await contractManager.getProjectInfo(tokenId);
            this.displayProjectInfo(projectInfo);
        } catch (error) {
            contractManager.showTransactionStatus('查询项目失败: ' + error.message, 'error');
        }
    }

    // 处理查询余额
    async handleQueryBalance() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('balanceTokenId').value;
        const address = document.getElementById('balanceAddress').value || null;

        try {
            const balance = await contractManager.getBalance(tokenId, address);
            const displayAddress = address || wallet.getCurrentAccount();
            const shortAddress = displayAddress.substring(0, 6) + '...' + displayAddress.substring(38);
            
            document.getElementById('balanceResult').innerHTML = 
                `地址 ${shortAddress} 在项目 ${tokenId} 中的余额: <strong>${balance}</strong> 个代币`;
        } catch (error) {
            contractManager.showTransactionStatus('查询余额失败: ' + error.message, 'error');
        }
    }

    // 显示项目信息
    displayProjectInfo(projectInfo) {
        const statusMap = {
            '0': '已创建',
            '1': '已验证', 
            '2': '已拒绝'
        };

        const typeMap = {
            'solar': '太阳能',
            'wind': '风能',
            'hydro': '水力',
            'reforestation': '植树造林',
            'carbon_capture': '碳捕获'
        };

        document.getElementById('info-projectId').textContent = projectInfo.projectId;
        document.getElementById('info-projectType').textContent = typeMap[projectInfo.projectType] || projectInfo.projectType;
        document.getElementById('info-location').textContent = projectInfo.location;
        document.getElementById('info-owner').textContent = this.shortenAddress(projectInfo.projectOwner);
        document.getElementById('info-verified').textContent = projectInfo.verifiedCredits;
        document.getElementById('info-minted').textContent = projectInfo.mintedCredits;
        document.getElementById('info-retired').textContent = projectInfo.retiredCredits;
        document.getElementById('info-active').textContent = projectInfo.mintedCredits - projectInfo.retiredCredits;
        document.getElementById('info-status').textContent = statusMap[projectInfo.status] || projectInfo.status;

        document.getElementById('projectInfo').style.display = 'block';
    }

    // 缩短地址显示
    shortenAddress(address) {
        if (!address) return '-';
        return address.substring(0, 6) + '...' + address.substring(38);
    }

    // 验证钱包连接
    validateWalletConnection() {
        if (!wallet.isWalletConnected()) {
            alert('请先连接钱包');
            return false;
        }
        if (!contractManager.isInitialized) {
            alert('合约未初始化，请重试');
            return false;
        }
        return true;
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CarbonCreditApp();
    console.log('🌿 CarbonCredit DApp 启动成功');
});