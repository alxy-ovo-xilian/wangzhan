import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { appConfig } from './config/app.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import configRoutes from './routes/config.js';
import { generateCaptcha } from './utils/captcha.js';
import { testConnection } from './db.js';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/config', configRoutes);

// 验证码路由
app.get('/api/captcha', async (req, res) => {
  try {
    const { uuid, captcha, expiryTime, svgImage } = await generateCaptcha();
    
    // 根据环境决定是否返回真实验证码用于显示
    const isDev = process.env.NODE_ENV === 'development';
    
    res.json({
      success: true,
      data: {
        uuid,
        // 在开发环境返回真实验证码用于显示，在生产环境返回图像URL
        ...(isDev ? { captcha } : {}),
        imageUrl: svgImage,
        expiryTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 仅在开发环境提供获取真实验证码的端点
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/captcha/debug', async (req, res) => {
    try {
      const { uuid, captcha, expiryTime } = await generateCaptcha();
      
      res.json({
        success: true,
        data: {
          uuid,
          captcha, // 开发环境返回真实验证码
          expiryTime
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

// 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '后端服务器运行中',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = appConfig.port;
app.listen(PORT, async () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 测试数据库连接: http://localhost:${PORT}/api/test-db`);
  
  // 测试数据库连接
  try {
    const result = await testConnection();
    console.log('✓ 数据库连接成功！', result.message);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
});

export default app;