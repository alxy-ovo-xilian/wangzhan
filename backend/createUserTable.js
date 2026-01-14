import pool from './db.js';

// 创建用户表
async function createUserTable() {
  const createUserTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(50),
      avatar VARCHAR(255),
      status TINYINT DEFAULT 1 COMMENT '0:禁用, 1:启用',
      last_login_time TIMESTAMP NULL,
      last_login_ip VARCHAR(45),
      login_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // 创建用户登录日志表
  const createLoginLogTableSQL = `
    CREATE TABLE IF NOT EXISTS user_login_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      username VARCHAR(50),
      ip_address VARCHAR(45),
      user_agent TEXT,
      login_status TINYINT COMMENT '1:成功, 0:失败',
      login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      failure_reason VARCHAR(255),
      INDEX idx_user_id (user_id),
      INDEX idx_username (username),
      INDEX idx_login_time (login_time),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // 创建系统配置表
  const createSysConfigTableSQL = `
    CREATE TABLE IF NOT EXISTS sys_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      config_key VARCHAR(100) UNIQUE NOT NULL,
      config_value TEXT,
      config_name VARCHAR(200),
      config_desc VARCHAR(500),
      config_type VARCHAR(50) DEFAULT 'string',
      module_name VARCHAR(50),
      editable BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_config_key (config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createUserTableSQL);
    console.log('✓ 用户表创建成功: users');
    
    await pool.query(createLoginLogTableSQL);
    console.log('✓ 用户登录日志表创建成功: user_login_logs');
    
    await pool.query(createSysConfigTableSQL);
    console.log('✓ 系统配置表创建成功: sys_config');
    
    // 插入默认系统配置
    const defaultConfigs = [
      { config_key: 'login.captcha.enabled', config_value: 'true', config_name: '验证码开关', config_desc: '是否启用登录验证码' },
      { config_key: 'login.register.enabled', config_value: 'true', config_name: '用户注册开关', config_desc: '是否允许用户注册' },
      { config_key: 'login.password.maxRetry', config_value: '5', config_name: '最大重试次数', config_desc: '密码错误最大允许尝试次数' },
      { config_key: 'login.password.lockTime', config_value: '600', config_name: '账户锁定时间', config_desc: '超出重试次数后的锁定时长(秒)' },
      { config_key: 'login.password.minLength', config_value: '5', config_name: '密码最小长度', config_desc: '密码最小长度要求' },
      { config_key: 'login.password.maxLength', config_value: '20', config_name: '密码最大长度', config_desc: '密码最大长度限制' },
      { config_key: 'security.ip.blacklist', config_value: '', config_name: 'IP黑名单', config_desc: '禁止访问的IP地址列表，用逗号分隔' }
    ];

    for (const config of defaultConfigs) {
      await pool.query(`
        INSERT IGNORE INTO sys_config (config_key, config_value, config_name, config_desc) 
        VALUES (?, ?, ?, ?)
      `, [config.config_key, config.config_value, config.config_name, config.config_desc]);
    }
    
    console.log('✓ 默认系统配置插入成功');
    
    return true;
  } catch (error) {
    console.error('✗ 创建用户相关表失败:', error.message);
    return false;
  }
}

// 执行创建表
createUserTable().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('错误:', error);
  process.exit(1);
});