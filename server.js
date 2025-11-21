const express = require('express');
const cors = require('cors');
const IPFSService = require('./ipfs-service');

const app = express();
const ipfsService = new IPFSService();

app.use(cors());
app.use(express.json());

// 上传碳信用元数据到IPFS
app.post('/api/upload-carbon-metadata', async (req, res) => {
  try {
    const { metadata } = req.body;
    
    if (!metadata) {
      return res.status(400).json({ error: 'Metadata is required' });
    }

    // 确保有必要的字段
    const carbonMetadata = {
      name: metadata.name || `CarbonCredit #${Date.now()}`,
      description: metadata.description || 'Carbon Credit',
      image: metadata.image || 'ipfs://placeholder',
      attributes: metadata.attributes || [],
      project_id: metadata.project_id || `PROJ-${Date.now()}`,
      timestamp: Date.now()
    };

    const result = await ipfsService.uploadJSON(carbonMetadata);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 从IPFS读取元数据
app.get('/api/carbon-metadata/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const data = await ipfsService.readJSON(cid);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 健康检查端点
app.get('/api/ipfs-status', async (req, res) => {
  try {
    // 检查IPFS是否运行
    const { exec } = require('child_process');
    exec('ipfs id', (error, stdout) => {
      if (error) {
        res.json({ status: 'error', message: 'IPFS not running' });
      } else {
        res.json({ status: 'running', message: 'IPFS is ready' });
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`IPFS API server running on port ${PORT}`);
});