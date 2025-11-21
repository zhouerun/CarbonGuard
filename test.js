const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始测试IPFS集成...');

// 测试IPFS是否安装
function testIPFSInstallation() {
  console.log('\n1. 测试IPFS是否安装...');
  
  return new Promise((resolve, reject) => {
    exec('ipfs --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ IPFS 未安装或不在PATH中');
        console.log('请先安装IPFS: https://docs.ipfs.io/install/');
        reject(error);
        return;
      }
      console.log('✅ IPFS 已安装:', stdout.trim());
      resolve(stdout);
    });
  });
}

// 测试IPFS守护进程是否运行
function testIPFSDaemon() {
  console.log('\n2. 测试IPFS守护进程...');
  
  return new Promise((resolve, reject) => {
    exec('ipfs id', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ IPFS 守护进程未运行');
        console.log('请先运行: ipfs daemon');
        reject(error);
        return;
      }
      
      try {
        const idInfo = JSON.parse(stdout);
        console.log('✅ IPFS 守护进程正在运行');
        console.log('   ID:', idInfo.ID);
        console.log('   地址:', idInfo.Addresses.join(', '));
        resolve(idInfo);
      } catch (parseError) {
        console.log('❌ 无法解析IPFS ID信息');
        reject(parseError);
      }
    });
  });
}

// 创建测试碳信用数据
function createTestCarbonData() {
  const testData = {
    name: "CarbonGuard Test Credit",
    description: "测试碳信用 - 开发阶段",
    image: "ipfs://QmTest123/carbon.png",
    attributes: [
      { trait_type: "项目类型", value: "太阳能" },
      { trait_type: "二氧化碳当量", value: "1000" },
      { trait_type: "状态", value: "活跃" }
    ],
    project_id: "TEST-" + Date.now(),
    retired: false,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n3. 创建测试数据:');
  console.log(JSON.stringify(testData, null, 2));
  
  return testData;
}

// 上传到IPFS
function uploadToIPFS(data) {
  console.log('\n4. 上传到IPFS...');
  
  return new Promise((resolve, reject) => {
    // 创建临时文件
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const filename = `carbon-test-${Date.now()}.json`;
    const filepath = path.join(tempDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log('   临时文件已创建:', filepath);
    
    // 调用IPFS命令行上传
    exec(`ipfs add "${filepath}"`, (error, stdout, stderr) => {
      // 清理临时文件
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      
      if (error) {
        console.log('❌ IPFS 上传失败:', error.message);
        reject(error);
        return;
      }
      
      console.log('   IPFS 输出:', stdout);
      
      // 解析CID
      const match = stdout.match(/added\s+(\w+)\s+/);
      if (match && match[1]) {
        const cid = match[1];
        console.log('✅ 上传成功!');
        console.log('   CID:', cid);
        console.log('   IPFS URL: https://ipfs.io/ipfs/' + cid);
        console.log('   Gateway URL: https://gateway.pinata.cloud/ipfs/' + cid);
        
        resolve({
          cid: cid,
          ipfsUrl: 'https://ipfs.io/ipfs/' + cid,
          gatewayUrl: 'https://gateway.pinata.cloud/ipfs/' + cid
        });
      } else {
        console.log('❌ 无法从输出中提取CID');
        reject(new Error('CID extraction failed'));
      }
    });
  });
}

// 从IPFS读取数据
function readFromIPFS(cid) {
  console.log('\n5. 从IPFS读取数据... CID:', cid);
  
  return new Promise((resolve, reject) => {
    exec(`ipfs cat ${cid}`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 读取失败:', error.message);
        reject(error);
        return;
      }
      
      try {
        const data = JSON.parse(stdout);
        console.log('✅ 数据读取成功:');
        console.log(JSON.stringify(data, null, 2));
        resolve(data);
      } catch (parseError) {
        console.log('❌ 数据解析失败:', parseError.message);
        reject(parseError);
      }
    });
  });
}

// 主测试函数
async function runTests() {
  try {
    console.log('=' .repeat(50));
    console.log('🧪 CarbonGuard IPFS 集成测试');
    console.log('=' .repeat(50));
    
    // 1. 测试IPFS安装
    await testIPFSInstallation();
    
    // 2. 测试守护进程
    await testIPFSDaemon();
    
    // 3. 创建测试数据
    const testData = createTestCarbonData();
    
    // 4. 上传到IPFS
    const uploadResult = await uploadToIPFS(testData);
    
    // 5. 从IPFS读取验证
    await readFromIPFS(uploadResult.cid);
    
    console.log('\n🎉 所有测试完成!');
    console.log('📝 下一步: 将此功能集成到你的后端API中');
    
  } catch (error) {
    console.log('\n💥 测试失败:', error.message);
    console.log('\n🔧 故障排除:');
    console.log('1. 确保已安装IPFS: https://docs.ipfs.io/install/');
    console.log('2. 启动IPFS守护进程: ipfs daemon');
    console.log('3. 检查网络连接');
    process.exit(1);
  }
}

// 运行测试
runTests();