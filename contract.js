class ContractManager {
    constructor() {
        this.contract = null;
        this.contractAddress = null;
        this.contractABI = null;
        this.isInitialized = false;
    }

    // 初始化合约
    async initContract() {
        try {
            if (!wallet.isWalletConnected()) {
                throw new Error('请先连接钱包');
            }

            // 合约地址和 ABI - 需要替换为您的实际值
            this.contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
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
                }
            ];

            // 创建合约实例
            this.contract = new wallet.web3.eth.Contract(
                this.contractABI,
                this.contractAddress
            );

            this.isInitialized = true;
            
            // 更新UI状态
            this.updateContractStatus();
            
            console.log('合约初始化成功');
            return true;

        } catch (error) {
            console.error('合约初始化失败:', error);
            this.showTransactionStatus('合约初始化失败: ' + error.message, 'error');
            return false;
        }
    }

    // 更新合约状态显示
    updateContractStatus() {
        const statusElement = document.getElementById('contractStatus');
        if (statusElement) {
            statusElement.textContent = this.isInitialized ? '已连接' : '未连接';
            statusElement.style.color = this.isInitialized ? '#4CAF50' : '#f44336';
        }
    }

    // 创建项目
    async createProject(projectId, projectType, location, tokenURI) {
        try {
            this.validateContract();

            const accounts = await wallet.web3.eth.getAccounts();
            const account = accounts[0];

            this.showTransactionStatus('正在创建项目...', 'pending');

            const result = await this.contract.methods
                .createProject(projectId, projectType, location, tokenURI)
                .send({ from: account });

            this.showTransactionStatus('项目创建成功!', 'success', result.transactionHash);
            
            // 从事件中获取 tokenId
            const tokenId = this.getTokenIdFromEvent(result);
            if (tokenId) {
                this.showTransactionStatus(`项目创建成功! Token ID: ${tokenId}`, 'success', result.transactionHash);
            }

            return result;

        } catch (error) {
            console.error('创建项目失败:', error);
            this.showTransactionStatus('创建项目失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 验证项目
    async verifyProject(tokenId, verifiedCredits) {
        try {
            this.validateContract();

            const accounts = await wallet.web3.eth.getAccounts();
            const account = accounts[0];

            this.showTransactionStatus('正在验证项目...', 'pending');

            const result = await this.contract.methods
                .verifyProject(tokenId, verifiedCredits)
                .send({ from: account });

            this.showTransactionStatus('项目验证成功!', 'success', result.transactionHash);
            return result;

        } catch (error) {
            console.error('验证项目失败:', error);
            this.showTransactionStatus('验证项目失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 铸造代币
    async mintCarbonCredit(tokenId, to, amount) {
        try {
            this.validateContract();

            const accounts = await wallet.web3.eth.getAccounts();
            const account = accounts[0];

            this.showTransactionStatus('正在铸造代币...', 'pending');

            const result = await this.contract.methods
                .mintCarbonCredit(tokenId, to, amount)
                .send({ from: account });

            this.showTransactionStatus('代币铸造成功!', 'success', result.transactionHash);
            return result;

        } catch (error) {
            console.error('铸造代币失败:', error);
            this.showTransactionStatus('铸造代币失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 退休代币
    async retireCarbonCredit(tokenId, amount, purpose) {
        try {
            this.validateContract();

            const accounts = await wallet.web3.eth.getAccounts();
            const account = accounts[0];

            this.showTransactionStatus('正在退休代币...', 'pending');

            const result = await this.contract.methods
                .retireCarbonCredit(tokenId, amount, purpose)
                .send({ from: account });

            this.showTransactionStatus('代币退休成功!', 'success', result.transactionHash);
            return result;

        } catch (error) {
            console.error('退休代币失败:', error);
            this.showTransactionStatus('退休代币失败: ' + error.message, 'error');
            throw error;
        }
    }

    // 查询项目信息
    async getProjectInfo(tokenId) {
        try {
            this.validateContract();

            const result = await this.contract.methods
                .getProjectInfo(tokenId)
                .call();

            return result;

        } catch (error) {
            console.error('查询项目信息失败:', error);
            throw error;
        }
    }

    // 查询余额
    async getBalance(tokenId, address = null) {
        try {
            this.validateContract();

            const queryAddress = address || wallet.getCurrentAccount();
            
            const balance = await this.contract.methods
                .balanceOf(queryAddress, tokenId)
                .call();

            return balance;

        } catch (error) {
            console.error('查询余额失败:', error);
            throw error;
        }
    }

    // 从事件中提取 tokenId
    getTokenIdFromEvent(transactionResult) {
        if (transactionResult.events && transactionResult.events.ProjectCreated) {
            return transactionResult.events.ProjectCreated.returnValues.tokenId;
        }
        return null;
    }

    // 验证合约状态
    validateContract() {
        if (!this.isInitialized || !this.contract) {
            throw new Error('合约未初始化，请先连接钱包');
        }
    }

    // 显示交易状态
    showTransactionStatus(message, type = 'info', transactionHash = null) {
        const statusElement = document.getElementById('transactionStatus');
        const messageElement = document.getElementById('statusMessage');
        const hashElement = document.getElementById('transactionHash');

        if (statusElement && messageElement) {
            statusElement.style.display = 'block';
            messageElement.textContent = message;
            
            // 设置颜色
            const colors = {
                pending: '#FF9800',
                success: '#4CAF50',
                error: '#f44336',
                info: '#2196F3'
            };
            
            messageElement.style.color = colors[type] || colors.info;

            // 显示交易哈希
            if (hashElement && transactionHash) {
                hashElement.innerHTML = `交易哈希: <a href="https://mumbai.polygonscan.com/tx/${transactionHash}" target="_blank" style="color: #2196F3;">${transactionHash}</a>`;
            } else if (hashElement) {
                hashElement.textContent = '';
            }
        }
    }
}

// 创建全局合约管理器实例
const contractManager = new ContractManager();