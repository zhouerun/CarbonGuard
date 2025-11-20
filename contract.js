// const { ethers } = window;
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract-config.js";

class ContractManager {
    constructor() {
        this.contract = null;
        this.contractAddress = null;
        this.contractABI = null;
        this.provider = null;
        this.signer = null;
        this.isInitialized = false;
    }

    //--------------------------------------------
    //        初始化合约（ethers.js）
    //--------------------------------------------
    async initContract() {
        try {
            if (!wallet.isWalletConnected()) {
                throw new Error("请先连接钱包");
            }

            this.contractAddress = CONTRACT_ADDRESS;
            this.contractABI = CONTRACT_ABI;

            //--------------------------------------------
            // 创建 Provider + Signer
            //--------------------------------------------
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();

            //--------------------------------------------
            // 创建 ethers 合约实例
            //--------------------------------------------
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.signer
            );

            this.isInitialized = true;
            this.updateContractStatus();

            console.log("🔗 合约初始化成功(ethers.js)");
            return true;

        } catch (error) {
            console.error("❌ 合约初始化失败:", error);
            this.showTransactionStatus("合约初始化失败: " + error.message, "error");
            return false;
        }
    }

    //--------------------------------------------
    // UI 状态显示
    //--------------------------------------------
    updateContractStatus() {
        const statusElement = document.getElementById("contractStatus");
        if (statusElement) {
            statusElement.textContent = this.isInitialized ? "已连接" : "未连接";
            statusElement.style.color = this.isInitialized ? "#4CAF50" : "#f44336";
        }
    }

    //--------------------------------------------
    // 统一错误解析
    //--------------------------------------------
    parseError(err) {
        console.error("⛔ ethers 错误对象:", err);

        if (err?.reason) return err.reason;
        if (err?.shortMessage) return err.shortMessage;

        if (err?.info?.error?.message) return err.info.error.message;

        if (err?.data?.message) return err.data.message;

        return err.message || "未知错误";
    }

    //--------------------------------------------
    // 统一发交易 sendTx() ——所有交易都通过这里
    //--------------------------------------------
    async sendTx(actionFn, pendingMsg = "交易进行中...") {
        try {
            this.validateContract();

            this.showTransactionStatus(pendingMsg, "pending");

            const tx = await actionFn();
            const receipt = await tx.wait();

            this.showTransactionStatus("交易成功！", "success", receipt.hash);
            return receipt;

        } catch (err) {
            const reason = this.parseError(err);
            this.showTransactionStatus("交易失败: " + reason, "error");
            throw err;
        }
    }

    // 创建项目
    async createProject(projectId, projectType, location, tokenURI) {
        // initFeePerProject 在合约里是public变量，可以直接get
        const initFee = await this.contract.initFeePerProject();

        return this.sendTx(
            () => this.contract.createProject(
                projectId,
                projectType,
                location,
                tokenURI,
                { value: initFee }      // ⭐ 这里附带 ETH
            ),
            "正在创建项目并支付初始化费..."
        ).then((receipt) => {
            const tokenId = this.extractTokenFromEvent(receipt, "ProjectCreated");
            if (tokenId) {
                this.showTransactionStatus(
                    `项目创建成功！Token ID: ${tokenId}`,
                    "success",
                    receipt.hash
                );
            }
            return receipt;
        });
    }


    //--------------------------------------------
    // 验证项目
    //--------------------------------------------
    async verifyProject(tokenId, verifiedCredits) {
        return this.sendTx(
            () => this.contract.verifyProject(tokenId, verifiedCredits),
            "正在验证项目..."
        );
    }

    //铸造碳信用额度
    async mintCarbonCredit(tokenId, to, amount) {
        // 1. 从链上读取每 credit 的费用
        const mintFeePerCredit = await this.contract.mintFeePerCredit();
        // 2. 计算总费用 = 单价 * 数量
        const totalFee = mintFeePerCredit * BigInt(amount); // amount 建议在外部转成 BigInt

        return this.sendTx(
            () => this.contract.mintCarbonCredit(
                tokenId,
                to,
                amount,
                { value: totalFee }      // ⭐ 关键：带上 value
            ),
            "正在铸造代币并支付铸造费用..."
        );
    }

    //退休代币
    async retireCarbonCredit(tokenId, amount, purpose) {
        const retireFeePerCredit = await this.contract.retireFeePerCredit();
        const totalFee = retireFeePerCredit * BigInt(amount);

        return this.sendTx(
            () => this.contract.retireCarbonCredit(
                tokenId,
                amount,
                purpose,
                { value: totalFee }     // ⭐ 关键
            ),
            "正在退休代币并支付注销费用..."
        );
    }


    //--------------------------------------------
    // 查询项目信息（call，不走交易）
    //--------------------------------------------
    async getProjectInfo(tokenId) {
        this.validateContract();
        return await this.contract.getProjectInfo(tokenId);
    }

    //--------------------------------------------
    // 查询余额（call）
    //--------------------------------------------
    async getBalance(tokenId, address = null) {
        this.validateContract();

        const account = address || (await this.signer.getAddress());
        return await this.contract.balanceOf(account, tokenId);
    }

    //--------------------------------------------
    // 转账代币
    //--------------------------------------------
    async transferTokens(tokenId, to, amount) {
        const from = await this.signer.getAddress();

        return this.sendTx(
            () =>
                this.contract.safeTransferFrom(
                    from,
                    to,
                    tokenId,
                    amount,
                    "0x"
                ),
            "正在转账..."
        );
    }

    //--------------------------------------------
    // 从事件中提取 tokenId
    //--------------------------------------------
    extractTokenFromEvent(receipt, evtName) {
        if (!receipt.logs) return null;

        try {
            const iface = new ethers.Interface(this.contractABI);

            for (const log of receipt.logs) {
                try {
                    const parsed = iface.parseLog(log);
                    if (parsed.name === evtName) {
                        return parsed.args.tokenId.toString();
                    }
                } catch (_) { }
            }
        } catch (e) {
            console.error("事件解析失败:", e);
        }
        return null;
    }

    //--------------------------------------------
    // 验证是否初始化
    //--------------------------------------------
    validateContract() {
        if (!this.isInitialized || !this.contract) {
            throw new Error("合约未初始化，请先连接钱包");
        }
    }

    //--------------------------------------------
    // UI 显示交易信息
    //--------------------------------------------
    showTransactionStatus(message, type = "info", transactionHash = null) {
        const statusElement = document.getElementById("transactionStatus");
        const messageElement = document.getElementById("statusMessage");
        const hashElement = document.getElementById("transactionHash");

        if (statusElement && messageElement) {
            statusElement.style.display = "block";
            messageElement.textContent = message;

            const colors = {
                pending: "#FF9800",
                success: "#4CAF50",
                error: "#f44336",
                info: "#2196F3",
            };
            messageElement.style.color = colors[type] || colors.info;

            if (hashElement && transactionHash) {
                hashElement.innerHTML = `交易哈希: <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank" style="color: #2196F3;">${transactionHash}</a>`;
            } else if (hashElement) {
                hashElement.textContent = "";
            }
        }
    }
}

//--------------------------------------------
//   导出全局合约管理器实例
//--------------------------------------------
const contractManager = new ContractManager();
window.contractManager = contractManager;
