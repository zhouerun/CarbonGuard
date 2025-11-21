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

        const uploadForm = document.getElementById('uploadMetadataForm');
        if (uploadForm) uploadForm.addEventListener('submit', (e) => { e.preventDefault(); this.handleUploadMetadata(); });

        const addAttrBtn = document.getElementById('addAttributeBtn');
        if (addAttrBtn) addAttrBtn.addEventListener('click', (e) => { e.preventDefault(); this.addAttributeRow(); });

        // 现有的移除属性按钮绑定
        document.querySelectorAll('.remove-attr').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); const row = btn.closest('.attribute-row'); if (row) row.remove(); });
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

        document.getElementById('transferForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransferTokens();
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
            // 🌟 在这里插入所有 fee 的 UI 展示
            this.showInitFee();
            this.setupMintFeeListener();
            this.setupRetireFeeListener();
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

    // 添加一个属性输入行
    addAttributeRow() {
        const container = document.getElementById('attributesContainer');
        if (!container) return;

        const div = document.createElement('div');
        div.className = 'attribute-row';
        div.innerHTML = `
            <input type="text" class="attr-type" placeholder="属性名 (trait_type)" />
            <input type="text" class="attr-value" placeholder="属性值 (value)" />
            <button class="remove-attr btn btn-sm" type="button">移除</button>
        `;
        container.appendChild(div);

        const removeBtn = div.querySelector('.remove-attr');
        if (removeBtn) removeBtn.addEventListener('click', (e) => { e.preventDefault(); div.remove(); });
    }

    // 处理上传元数据到后端 server.js（并展示返回结果）
    async handleUploadMetadata() {
        // Ensure wallet connected (same pattern as handleCreateProject)
        if (!this.validateWalletConnection()) return;

        const name = document.getElementById('metaName')?.value || '';
        const description = document.getElementById('metaDescription')?.value || '';
        const image = document.getElementById('metaImage')?.value || '';
        const projectId = document.getElementById('metaProjectId')?.value || `TEST-${Date.now()}`;

        const attributes = [];
        const rows = document.querySelectorAll('#attributesContainer .attribute-row');
        rows.forEach(r => {
            const t = r.querySelector('.attr-type')?.value || '';
            const v = r.querySelector('.attr-value')?.value || '';
            if (t || v) attributes.push({ trait_type: t, value: v });
        });

        const metadata = {
            name: name || `CarbonCredit Test ${Date.now()}`,
            description: description || 'Carbon Credit',
            image: image || 'ipfs://placeholder',
            attributes: attributes,
            project_id: projectId,
            timestamp: new Date().toISOString()
        };

        const resultEl = document.getElementById('uploadResult');
        if (resultEl) resultEl.innerHTML = '上传中...';

        try {
            const res = await fetch('http://localhost:3001/api/upload-carbon-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata })
            });

            const data = await res.json();
            this.displayUploadResult(data);

            // show a brief transaction/status message if contractManager exposes helper
            try { if (contractManager && contractManager.showTransactionStatus) contractManager.showTransactionStatus('元数据上传完成', 'success'); } catch(e) {}

            // 重置表单（不影响 displayUploadResult 的内容）
            const uploadForm = document.getElementById('uploadMetadataForm');
            if (uploadForm) uploadForm.reset();

        } catch (err) {
            console.error('Upload failed', err);
            try { if (contractManager && contractManager.showTransactionStatus) contractManager.showTransactionStatus('元数据上传失败: ' + err.message, 'error'); } catch(e) {}
            if (resultEl) resultEl.innerHTML = `<div class="error">上传失败: ${err.message}</div>`;
        }
    }

    // 在前端显示 server 返回的信息
    displayUploadResult(resp) {
        const el = document.getElementById('uploadResult');
        if (!el) return;

            // 以纯文本显示后端返回的原始 JSON
        try {
            el.textContent = JSON.stringify(resp, null, 2);
        } catch (e) {
            el.textContent = String(resp);
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

    // 处理转账代币
    async handleTransferTokens() {
        if (!this.validateWalletConnection()) return;

        const tokenId = document.getElementById('transferTokenId').value;
        const to = document.getElementById('transferTo').value;
        const amount = document.getElementById('transferAmount').value;

        try {
            await contractManager.transferTokens(tokenId, to, amount);
            document.getElementById('transferForm').reset();
        } catch (error) {
            contractManager.showTransactionStatus('转账失败: ' + error.message, 'error');
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

    async showInitFee() {
        try {
            const fee = await contractManager.contract.initFeePerProject();
            const ethFee = ethers.formatEther(fee);

            const el = document.getElementById("initFeeInfo");
            if (el) {
                el.innerHTML = `
                <span style="color:#764ba2;">此操作将收取 <b>${ethFee} ETH</b> 初始化费用</span>
            `;
            }
        } catch (err) {
            console.error("初始化费用获取失败:", err);
        }
    }

    setupMintFeeListener() {
        const input = document.getElementById("mintAmount");
        const info = document.getElementById("mintFeeInfo");

        if (!input || !info) return;

        input.addEventListener("input", async () => {
            if (!input.value) {
                info.textContent = "";
                return;
            }

            const feePer = await contractManager.contract.mintFeePerCredit();
            const total = feePer * BigInt(input.value);
            info.innerHTML = `
            <span style="color:#764ba2;">本次铸造将收取 <b>${ethers.formatEther(total)} ETH</b></span>
        `;
        });
    }

    setupRetireFeeListener() {
        const input = document.getElementById("retireAmount");
        const info = document.getElementById("retireFeeInfo");

        if (!input || !info) return;

        input.addEventListener("input", async () => {
            if (!input.value) {
                info.textContent = "";
                return;
            }

            const feePer = await contractManager.contract.retireFeePerCredit();
            const total = feePer * BigInt(input.value);
            info.innerHTML = `
            <span style="color:#764ba2;">本次注销将收取 <b>${ethers.formatEther(total)} ETH</b></span>
        `;
        });
    }

}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CarbonCreditApp();
    console.log('🌿 CarbonCredit DApp 启动成功');
});