class WalletConnector {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.networkId = null;
        this.isConnected = false;
    }

    // 初始化 Web3
    async initWeb3() {
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            console.log('Web3 初始化成功');
            return true;
        } else if (window.web3) {
            this.web3 = new Web3(window.web3.currentProvider);
            console.log('Web3 初始化成功 (旧版本)');
            return true;
        } else {
            console.error('请安装 MetaMask!');
            this.showError('请安装 MetaMask 钱包扩展程序');
            return false;
        }
    }

    // 连接钱包
    async connectWallet() {
        try {
            if (!this.web3) {
                const initialized = await this.initWeb3();
                if (!initialized) return false;
            }

            // 请求账户访问
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.account = accounts[0];
            this.isConnected = true;

            // 获取网络信息
            this.networkId = await this.web3.eth.net.getId();
            const networkName = this.getNetworkName(this.networkId);

            // 更新UI
            this.updateWalletDisplay();
            this.updateNetworkDisplay(networkName);

            console.log('钱包连接成功:', this.account);
            this.showSuccess('钱包连接成功!');

            // 监听账户变化
            this.setupEventListeners();

            return true;

        } catch (error) {
            console.error('连接钱包失败:', error);
            this.showError('连接钱包失败: ' + error.message);
            return false;
        }
    }

    // 获取网络名称
    getNetworkName(networkId) {
        const networks = {
            1: 'Ethereum 主网',
            3: 'Ropsten 测试网',
            4: 'Rinkeby 测试网',
            5: 'Goerli 测试网',
            42: 'Kovan 测试网',
            137: 'Polygon 主网',
            80001: 'Polygon Mumbai 测试网',
            1337: '本地开发网络',
            5777: 'Ganache 本地网络'
        };
        return networks[networkId] || `未知网络 (ID: ${networkId})`;
    }

    // 更新钱包显示
    updateWalletDisplay() {
        const walletElement = document.getElementById('walletAddress');
        const accountElement = document.getElementById('currentAccount');
        
        if (walletElement && accountElement) {
            const shortAddress = this.account.substring(0, 6) + '...' + this.account.substring(38);
            walletElement.textContent = shortAddress;
            accountElement.textContent = shortAddress;
        }
    }

    // 更新网络显示
    updateNetworkDisplay(networkName) {
        const networkElement = document.getElementById('networkInfo');
        const statusElement = document.getElementById('networkStatus');
        
        if (networkElement && statusElement) {
            networkElement.textContent = networkName;
            statusElement.textContent = '已连接 - ' + networkName;
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.handleDisconnect();
            } else {
                this.account = accounts[0];
                this.updateWalletDisplay();
                this.showInfo('账户已切换');
            }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
            this.networkId = parseInt(chainId, 16);
            const networkName = this.getNetworkName(this.networkId);
            this.updateNetworkDisplay(networkName);
            this.showInfo('网络已切换: ' + networkName);
            
            // 重新初始化合约
            if (window.contractManager) {
                window.contractManager.initContract();
            }
        });
    }

    // 处理断开连接
    handleDisconnect() {
        this.isConnected = false;
        this.account = null;
        
        const walletElement = document.getElementById('walletAddress');
        const accountElement = document.getElementById('currentAccount');
        const statusElement = document.getElementById('networkStatus');
        
        if (walletElement) walletElement.textContent = '未连接';
        if (accountElement) accountElement.textContent = '未连接';
        if (statusElement) statusElement.textContent = '未连接';
        
        this.showInfo('钱包已断开连接');
    }

    // 显示消息的工具函数
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        // 这里可以集成更复杂的消息提示系统
        console.log(`${type}: ${message}`);
        alert(message); // 简单使用 alert，可以替换为更友好的提示
    }

    // 获取当前账户
    getCurrentAccount() {
        return this.account;
    }

    // 获取 Web3 实例
    getWeb3() {
        return this.web3;
    }

    // 检查是否已连接
    isWalletConnected() {
        return this.isConnected && this.account !== null;
    }
}

// 创建全局钱包实例
const wallet = new WalletConnector();