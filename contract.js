// const { ethers } = window;


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

            this.contractAddress = "0x5E314312619e5aC68cD409458D15b1f249E4247f";
            this.contractABI = [
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "_uri",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "needed",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "ERC1155InsufficientBalance",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "approver",
                            "type": "address"
                        }
                    ],
                    "name": "ERC1155InvalidApprover",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "idsLength",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "valuesLength",
                            "type": "uint256"
                        }
                    ],
                    "name": "ERC1155InvalidArrayLength",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        }
                    ],
                    "name": "ERC1155InvalidOperator",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "receiver",
                            "type": "address"
                        }
                    ],
                    "name": "ERC1155InvalidReceiver",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        }
                    ],
                    "name": "ERC1155InvalidSender",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "ERC1155MissingApprovalForAll",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "OwnableInvalidOwner",
                    "type": "error"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        }
                    ],
                    "name": "OwnableUnauthorizedAccount",
                    "type": "error"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "bool",
                            "name": "approved",
                            "type": "bool"
                        }
                    ],
                    "name": "ApprovalForAll",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "CarbonCreditMinted",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "retirer",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "purpose",
                            "type": "string"
                        }
                    ],
                    "name": "CarbonCreditRetired",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "projectId",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "projectType",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "location",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "tokenURI",
                            "type": "string"
                        }
                    ],
                    "name": "createProject",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "mintCarbonCredit",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "previousOwner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "OwnershipTransferred",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "projectOwner",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "projectId",
                            "type": "string"
                        }
                    ],
                    "name": "ProjectCreated",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "auditor",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "credits",
                            "type": "uint256"
                        }
                    ],
                    "name": "ProjectVerified",
                    "type": "event"
                },
                {
                    "inputs": [],
                    "name": "renounceOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "purpose",
                            "type": "string"
                        }
                    ],
                    "name": "retireCarbonCredit",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256[]",
                            "name": "ids",
                            "type": "uint256[]"
                        },
                        {
                            "internalType": "uint256[]",
                            "name": "values",
                            "type": "uint256[]"
                        },
                        {
                            "internalType": "bytes",
                            "name": "data",
                            "type": "bytes"
                        }
                    ],
                    "name": "safeBatchTransferFrom",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "data",
                            "type": "bytes"
                        }
                    ],
                    "name": "safeTransferFrom",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        },
                        {
                            "internalType": "bool",
                            "name": "approved",
                            "type": "bool"
                        }
                    ],
                    "name": "setApprovalForAll",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_auditor",
                            "type": "address"
                        }
                    ],
                    "name": "setAuditor",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256[]",
                            "name": "ids",
                            "type": "uint256[]"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256[]",
                            "name": "values",
                            "type": "uint256[]"
                        }
                    ],
                    "name": "TransferBatch",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "transferOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "TransferSingle",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "value",
                            "type": "string"
                        },
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        }
                    ],
                    "name": "URI",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "verifiedCredits",
                            "type": "uint256"
                        }
                    ],
                    "name": "verifyProject",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "auditor",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address[]",
                            "name": "accounts",
                            "type": "address[]"
                        },
                        {
                            "internalType": "uint256[]",
                            "name": "ids",
                            "type": "uint256[]"
                        }
                    ],
                    "name": "balanceOfBatch",
                    "outputs": [
                        {
                            "internalType": "uint256[]",
                            "name": "",
                            "type": "uint256[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getActiveCredits",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getProjectInfo",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "tokenId",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "projectOwner",
                                    "type": "address"
                                },
                                {
                                    "internalType": "string",
                                    "name": "projectId",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "projectType",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "location",
                                    "type": "string"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "verifiedCredits",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "enum SimpleCarbonCredit.ProjectStatus",
                                    "name": "status",
                                    "type": "uint8"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "mintedCredits",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "retiredCredits",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct SimpleCarbonCredit.Project",
                            "name": "",
                            "type": "tuple"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "operator",
                            "type": "address"
                        }
                    ],
                    "name": "isApprovedForAll",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "name": "projects",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "projectOwner",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "projectId",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "projectType",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "location",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "verifiedCredits",
                            "type": "uint256"
                        },
                        {
                            "internalType": "enum SimpleCarbonCredit.ProjectStatus",
                            "name": "status",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint256",
                            "name": "mintedCredits",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "retiredCredits",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes4",
                            "name": "interfaceId",
                            "type": "bytes4"
                        }
                    ],
                    "name": "supportsInterface",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "uri",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];

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

    //--------------------------------------------
    // 创建项目
    //--------------------------------------------
    async createProject(projectId, projectType, location, tokenURI) {
        return this.sendTx(
            () =>
                this.contract.createProject(
                    projectId,
                    projectType,
                    location,
                    tokenURI
                ),
            "正在创建项目..."
        ).then((receipt) => {
            // 从事件中解析 tokenId
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

    //--------------------------------------------
    // 铸造碳信用额度
    //--------------------------------------------
    async mintCarbonCredit(tokenId, to, amount) {
        return this.sendTx(
            () => this.contract.mintCarbonCredit(tokenId, to, amount),
            "正在铸造代币..."
        );
    }

    //--------------------------------------------
    // 退休代币
    //--------------------------------------------
    async retireCarbonCredit(tokenId, amount, purpose) {
        return this.sendTx(
            () =>
                this.contract.retireCarbonCredit(
                    tokenId,
                    amount,
                    purpose
                ),
            "正在退休代币..."
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
