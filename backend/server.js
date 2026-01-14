import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, query } from './db.js';
import { generateCaptcha, verifyCaptcha, isCaptchaEnabled } from './utils/captcha.js';
import { generateToken } from './utils/auth.js';
import { loginService, registerService, isIpBlacklisted, getUserById } from './services/userService.js';
import { authenticateToken } from './middleware/auth.js';
import { getSystemConfig, updateSystemConfig, addSystemConfig, getConfigByModule, refreshConfigCache } from './services/configService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试连接
testConnection();

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: '后端服务器运行中',
    status: 'success'
  });
});

// 测试数据库连接的API
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        success: true, 
        message: '数据库连接成功' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: '数据库连接失败' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 示例：查询数据的API
app.get('/api/data', async (req, res) => {
  try {
    // 这里可以根据你的需求修改SQL查询
    const results = await query('SELECT 1 + 1 AS solution');
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 获取所有股票指数数据
app.get('/api/stock-index-data', async (req, res) => {
  try {
    const { indexCode, limit = 100, offset = 0 } = req.query;
    let sql = 'SELECT * FROM stock_index_data';
    let params = [];
    
    if (indexCode) {
      sql += ' WHERE index_code = ?';
      params.push(indexCode);
    }
    
    const limitNum = parseInt(limit || 100);
    const offsetNum = parseInt(offset || 0);
    
    sql += ' ORDER BY candle_end_time DESC, index_code';
    
    // 直接在SQL中使用数字值，而不是参数绑定
    sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    const results = await query(sql, params);
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 获取股票指数数据总数
app.get('/api/stock-index-data-count', async (req, res) => {
  try {
    const { indexCode } = req.query;
    let sql = 'SELECT COUNT(*) as count FROM stock_index_data';
    let params = [];
    
    if (indexCode) {
      sql += ' WHERE index_code = ?';
      params.push(indexCode);
    }
    
    const results = await query(sql, params);
    res.json({ 
      success: true, 
      data: results[0] 
    });
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 获取所有不同的指数代码
app.get('/api/stock-index-codes', async (req, res) => {
  try {
    const results = await query('SELECT DISTINCT index_code FROM stock_index_data ORDER BY index_code');
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 获取特定指数的最新数据
app.get('/api/stock-index-latest', async (req, res) => {
  try {
    const { indexCode } = req.query;
    
    if (!indexCode) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少指数代码参数' 
      });
    }
    
    const results = await query(
      'SELECT * FROM stock_index_data WHERE index_code = ? ORDER BY candle_end_time DESC LIMIT 1', 
      [indexCode]
    );
    
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 添加或更新股票指数数据
app.post('/api/stock-index-data', async (req, res) => {
  try {
    const { candle_end_time, open, high, low, close, amount, volume, index_code } = req.body;
    
    const result = await query(
      `INSERT INTO stock_index_data (candle_end_time, open, high, low, close, amount, volume, index_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       open = VALUES(open), high = VALUES(high), low = VALUES(low), 
       close = VALUES(close), amount = VALUES(amount), volume = VALUES(volume)`,
      [candle_end_time, parseFloat(open) || null, parseFloat(high) || null, parseFloat(low) || null, parseFloat(close) || null, parseFloat(amount) || null, parseFloat(volume) || null, index_code]
    );
    
    res.json({ 
      success: true, 
      message: result.affectedRows > 0 ? '数据保存成功' : '数据未变化',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 删除特定的股票指数数据
app.delete('/api/stock-index-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM stock_index_data WHERE id = ?', [id]);
    
    res.json({ 
      success: true, 
      message: result.affectedRows > 0 ? '数据删除成功' : '未找到匹配数据',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 示例：插入数据的API
app.post('/api/data', async (req, res) => {
  try {
    const { /* 你的字段 */ } = req.body;
    // 根据你的表结构修改SQL
    // const results = await query('INSERT INTO your_table (field1, field2) VALUES (?, ?)', [value1, value2]);
    res.json({ 
      success: true, 
      message: '数据插入成功'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 获取验证码（开发环境显示真实验证码）
app.get('/api/captcha', async (req, res) => {
  try {
    const { uuid, captcha, expiryTime } = await generateCaptcha();
    
    res.json({
      success: true,
      data: {
        uuid,
        captcha: process.env.NODE_ENV === 'production' ? '****' : captcha, // 生产环境不返回真实验证码
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

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, captcha, captchaId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // 检查IP是否在黑名单中
    if (await isIpBlacklisted(ipAddress)) {
      return res.status(403).json({
        success: false,
        message: '您的IP地址已被禁止访问'
      });
    }
    
    // 检查是否启用验证码
    const captchaEnabled = await isCaptchaEnabled();
    if (captchaEnabled) {
      if (!captcha || !captchaId) {
        return res.status(400).json({
          success: false,
          message: '请输入验证码'
        });
      }
      
      const captchaResult = await verifyCaptcha(captchaId, captcha);
      if (!captchaResult.valid) {
        return res.status(400).json({
          success: false,
          message: captchaResult.message
        });
      }
    }
    
    // 调用登录服务
    const loginResult = await loginService(username, password, ipAddress, userAgent);
    
    if (loginResult.success) {
      // 生成JWT令牌
      const token = generateToken(loginResult.user);
      
      res.json({
        success: true,
        message: loginResult.message,
        data: {
          token,
          user: loginResult.user
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: loginResult.message
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录服务异常'
    });
  }
});

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, nickname, captcha, captchaId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // 检查IP是否在黑名单中
    if (await isIpBlacklisted(ipAddress)) {
      return res.status(403).json({
        success: false,
        message: '您的IP地址已被禁止访问'
      });
    }
    
    // 检查是否启用注册
    const registerEnabled = await getSystemConfig('login.register.enabled');
    if (registerEnabled !== 'true') {
      return res.status(403).json({
        success: false,
        message: '用户注册功能已关闭'
      });
    }
    
    // 检查是否启用验证码
    const captchaEnabled = await isCaptchaEnabled();
    if (captchaEnabled) {
      if (!captcha || !captchaId) {
        return res.status(400).json({
          success: false,
          message: '请输入验证码'
        });
      }
      
      const captchaResult = await verifyCaptcha(captchaId, captcha);
      if (!captchaResult.valid) {
        return res.status(400).json({
          success: false,
          message: captchaResult.message
        });
      }
    }
    
    // 调用注册服务
    const registerResult = await registerService(username, email, password, nickname);
    
    if (registerResult.success) {
      res.json({
        success: true,
        message: registerResult.message,
        data: {
          userId: registerResult.userId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: registerResult.message
      });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册服务异常'
    });
  }
});

// 测试用户注册（跳过验证码，仅用于开发测试）
app.post('/api/register-test', async (req, res) => {
  try {
    const { username, email, password, nickname } = req.body;
    
    // 调用注册服务
    const registerResult = await registerService(username, email, password, nickname);
    
    if (registerResult.success) {
      res.json({
        success: true,
        message: registerResult.message,
        data: {
          userId: registerResult.userId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: registerResult.message
      });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册服务异常'
    });
  }
});

// 获取当前登录用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 用户注销
app.post('/api/logout', async (req, res) => {
  try {
    // 注销操作通常是在前端清除令牌，后端可以记录注销日志
    res.json({
      success: true,
      message: '注销成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取系统配置
app.get('/api/config/:key?', authenticateToken, async (req, res) => {
  try {
    const configKey = req.params.key;
    const config = await getSystemConfig(configKey);
    
    if (configKey) {
      res.json({
        success: true,
        data: { [configKey]: config }
      });
    } else {
      res.json({
        success: true,
        data: config
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 更新系统配置
app.put('/api/config/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await updateSystemConfig(key, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 添加系统配置
app.post('/api/config', authenticateToken, async (req, res) => {
  try {
    const { key, value, name, description, type, module } = req.body;
    
    const result = await addSystemConfig(key, value, name, description, type, module);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 按模块获取配置
app.get('/api/config/module/:module', authenticateToken, async (req, res) => {
  try {
    const { module } = req.params;
    
    const result = await getConfigByModule(module);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 刷新配置缓存
app.post('/api/config/refresh', authenticateToken, async (req, res) => {
  try {
    await refreshConfigCache();
    res.json({
      success: true,
      message: '配置缓存刷新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取配置详情（包含元数据）
app.get('/api/config-details', authenticateToken, async (req, res) => {
  try {
    const results = await query(`
      SELECT config_key, config_value, config_name, config_desc, 
             config_type, module_name, editable
      FROM sys_config
      ORDER BY module_name, config_key
    `);
    
    res.json({
      success: true,
      data: results
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 测试数据库连接: http://localhost:${PORT}/api/test-db\n`);
});
