const { ethers } = require('ethers');
require('dotenv').config();

console.log("=== 项目设置检查 ===\n");

// 检查环境变量
console.log("1. 环境变量检查:");
console.log("   PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✓ 已设置" : "✗ 未设置");
console.log("   CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS ? "✓ 已设置" : "✗ 未设置");
console.log("   RPC_URL:", process.env.RPC_URL ? "✓ 已设置" : "✗ 未设置");

// 检查依赖
console.log("\n2. 依赖检查:");
try {
    const ethersVersion = require('ethers/package.json').version;
    console.log("   ethers.js:", "✓ 已安装 (v" + ethersVersion + ")");
} catch (e) {
    console.log("   ethers.js:", "✗ 未安装");
}

try {
    require('dotenv');
    console.log("   dotenv:", "✓ 已安装");
} catch (e) {
    console.log("   dotenv:", "✗ 未安装");
}

// 检查网络连接
console.log("\n3. 网络连接检查:");
if (process.env.RPC_URL && process.env.PRIVATE_KEY) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        console.log("   网络:", "✓ 连接成功");
        console.log("   账户余额:", ethers.formatEther(balance), "ETH");
    } catch (e) {
        console.log("   网络:", "✗ 连接失败 -", e.message);
    }
} else {
    console.log("   网络:", "✗ 缺少配置");
}

console.log("\n=== 检查完成 ===");