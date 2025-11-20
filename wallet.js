const { ethers } = window;


class WalletConnector {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.networkId = null;
        this.isConnected = false;
    }

    //------------------------------------------------
    // 初始化 Provider
    //------------------------------------------------
    async initProvider() {
        if (!window.ethereum) {
            this.showError("请安装 MetaMask 钱包扩展程序");
            console.error("MetaMask 未安装");
            return false;
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        console.log("ethers Provider 初始化成功");
        return true;
    }

    //------------------------------------------------
    // 连接钱包（替代 web3.eth.requestAccounts）
    //------------------------------------------------
    async connectWallet() {
        try {
            if (!this.provider) {
                const ok = await this.initProvider();
                if (!ok) return false;
            }

            // 请求 MetaMask 授权并获取 signer
            this.signer = await this.provider.getSigner();
            this.account = await this.signer.getAddress();
            this.isConnected = true;

            // 获取网络信息
            const network = await this.provider.getNetwork();
            this.networkId = Number(network.chainId);

            const networkName = this.getNetworkName(this.networkId);

            // 更新 UI
            this.updateWalletDisplay();
            this.updateNetworkDisplay(networkName);

            console.log("钱包连接成功:", this.account);
            this.showSuccess("钱包连接成功！");

            // 监听账户与链
            this.setupEventListeners();

            return true;

        } catch (err) {
            console.error("钱包连接失败:", err);
            this.showError("连接钱包失败: " + err.message);
            return false;
        }
    }

    //------------------------------------------------
    // 获取网络名称
    //------------------------------------------------
    getNetworkName(networkId) {
        const networks = {
            1: "Ethereum 主网",
            5: "Goerli 测试网",
            11155111: "Sepolia 测试网",
            137: "Polygon 主网",
            80001: "Mumbai 测试网",
            5777: "Ganache 本地网络",
        };
        return networks[networkId] || `未知网络 (Chain ID: ${networkId})`;
    }

    //------------------------------------------------
    // UI 更新 - 钱包地址
    //------------------------------------------------
    updateWalletDisplay() {
        const walletElement = document.getElementById("walletAddress");
        const accountElement = document.getElementById("currentAccount");

        if (walletElement && accountElement) {
            const short = this.shortenAddress(this.account);
            walletElement.textContent = short;
            accountElement.textContent = short;
        }
    }

    shortenAddress(address) {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4);
    }

    //------------------------------------------------
    // UI 更新 - 网络
    //------------------------------------------------
    updateNetworkDisplay(networkName) {
        const networkElement = document.getElementById("networkInfo");
        const statusElement = document.getElementById("networkStatus");

        if (networkElement && statusElement) {
            networkElement.textContent = networkName;
            statusElement.textContent = "已连接 - " + networkName;
        }
    }

    //------------------------------------------------
    // MetaMask 事件监听
    //------------------------------------------------
    setupEventListeners() {
        if (!window.ethereum) return;

        window.ethereum.on("accountsChanged", async (accounts) => {
            console.log("🔄 账户切换:", accounts);

            if (accounts.length === 0) {
                this.handleDisconnect();
                return;
            }

            // 重新初始化 provider + signer（关键修复点）
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.account = await this.signer.getAddress();

            // 更新 UI
            this.updateWalletDisplay();
            this.showInfo("账户已切换");

            // 同步更新 ContractManager（必须）
            if (window.contractManager) {
                await window.contractManager.initContract();
            }
        });


        // 网络变化
        window.ethereum.on("chainChanged", async (chainIdHex) => {
            this.networkId = parseInt(chainIdHex, 16);
            const networkName = this.getNetworkName(this.networkId);

            this.updateNetworkDisplay(networkName);
            this.showInfo("网络已切换: " + networkName);

            // 重新初始化 Contract（ethers 自动适配 chainId）
            if (window.contractManager) {
                await window.contractManager.initContract();
            }
        });
    }

    //------------------------------------------------
    // 断开钱包
    //------------------------------------------------
    handleDisconnect() {
        this.isConnected = false;
        this.account = null;

        const walletElement = document.getElementById("walletAddress");
        const accountElement = document.getElementById("currentAccount");
        const statusElement = document.getElementById("networkStatus");

        if (walletElement) walletElement.textContent = "未连接";
        if (accountElement) accountElement.textContent = "未连接";
        if (statusElement) statusElement.textContent = "未连接";

        this.showInfo("钱包已断开连接");
    }

    //------------------------------------------------
    // 工具函数（提示 UI）
    //------------------------------------------------
    showSuccess(msg) {
        this.showMessage(msg, "success");
    }
    showError(msg) {
        this.showMessage(msg, "error");
    }
    showInfo(msg) {
        this.showMessage(msg, "info");
    }

    showMessage(message, type = "info") {
        console.log(`${type}: ${message}`);
        alert(message);
    }

    //------------------------------------------------
    // 对外 API
    //------------------------------------------------
    getCurrentAccount() {
        return this.account;
    }

    isWalletConnected() {
        return this.isConnected;
    }

    getSigner() {
        return this.signer;
    }

    getProvider() {
        return this.provider;
    }
}

// 挂到全局
const wallet = new WalletConnector();
window.wallet = wallet;
