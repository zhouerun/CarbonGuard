const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class IPFSService {
  constructor() {
    // 使用系统临时目录，避免在项目工作区內创建文件触发文件监视器（例如 Live Server 自动刷新）
    const sysTmp = os.tmpdir();
    this.tempDir = path.join(sysTmp, 'carbonguard-temp');
    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 上传JSON到IPFS
  async uploadJSON(data) {
    return new Promise((resolve, reject) => {
      // 创建临时文件
      const filename = `carbon-${Date.now()}.json`;
      const filepath = path.join(this.tempDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      
      // 调用IPFS命令行
      exec(`ipfs add ${filepath}`, (error, stdout, stderr) => {
        if (error) {
          // 清理临时文件
          fs.unlinkSync(filepath);
          reject(error);
          return;
        }
        
        // 解析IPFS返回结果，提取CID
        const match = stdout.match(/added\s+(\w+)\s+/);
        if (match && match[1]) {
          const cid = match[1];
          
          // 清理临时文件
          fs.unlinkSync(filepath);
          
          resolve({
            cid: cid,
            ipfsUrl: `https://ipfs.io/ipfs/${cid}`,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`
          });
        } else {
          fs.unlinkSync(filepath);
          reject(new Error('Failed to get CID from IPFS output'));
        }
      });
    });
  }

  // 从IPFS读取数据
  async readJSON(cid) {
    return new Promise((resolve, reject) => {
      exec(`ipfs cat ${cid}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }
}

module.exports = IPFSService;