配置合约信息
在 contract-config.js 中替换以下信息：

javascript
this.contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
this.contractABI = [ /* 从 Remix 复制的完整 ABI */ ];

配置dashboard信息
需要去metamask dev中获取api key（不要上传到git）
在根目录新建dashboard-config.js配置文件，该文件已写入.gitignore中，防止错误提交
增加配置export const INFURA_KEY = “xxx”
