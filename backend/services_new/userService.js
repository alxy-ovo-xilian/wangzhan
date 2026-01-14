import { query } from '../db.js';
import { hashPassword, verifyPassword, validatePassword, validateUsername } from '../utils/auth.js';

// 用户登录服务
export const loginService = async (username, password, ipAddress, userAgent) => {
  try {
    // 首先检查用户是否存在
    const userResult = await query(
      'SELECT id, username, email, password, nickname, status FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (userResult.length === 0) {
      // 记录登录失败日志
      await logUserLogin(null, username, ipAddress, userAgent, 0, '用户名不存在');
      return { success: false, message: '用户名或密码错误' };
    }

    const user = userResult[0];

    // 检查用户状态
    if (user.status === 0) {
      await logUserLogin(user.id, username, ipAddress, userAgent, 0, '账户已被禁用');
      return { success: false, message: '账户已被禁用' };
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      await logUserLogin(user.id, username, ipAddress, userAgent, 0, '密码错误');
      return { success: false, message: '用户名或密码错误' };
    }

    // 更新用户登录信息
    await query(
      'UPDATE users SET last_login_time = NOW(), last_login_ip = ?, login_count = login_count + 1 WHERE id = ?',
      [ipAddress, user.id]
    );

    // 记录登录成功日志
    await logUserLogin(user.id, username, ipAddress, userAgent, 1);

    // 返回用户信息（排除密码）
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      lastLoginTime: new Date()
    };

    return { success: true, message: '登录成功', user: userInfo };
  } catch (error) {
    console.error('登录服务错误:', error);
    return { success: false, message: '登录服务异常' };
  }
};

// 用户注册服务
export const registerService = async (username, email, password, nickname) => {
  try {
    // 验证用户名格式
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return { success: false, message: usernameValidation.message };
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }

    // 检查用户名是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return { success: false, message: '用户名或邮箱已被注册' };
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const result = await query(
      'INSERT INTO users (username, email, password, nickname) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, nickname || username]
    );

    if (result.affectedRows > 0) {
      return { 
        success: true, 
        message: '注册成功', 
        userId: result.insertId 
      };
    } else {
      return { success: false, message: '注册失败' };
    }
  } catch (error) {
    console.error('注册服务错误:', error);
    return { success: false, message: '注册服务异常' };
  }
};

// 记录用户登录日志
export const logUserLogin = async (userId, username, ipAddress, userAgent, loginStatus, failureReason = null) => {
  try {
    await query(
      'INSERT INTO user_login_logs (user_id, username, ip_address, user_agent, login_status, failure_reason) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, ipAddress, userAgent, loginStatus, failureReason]
    );
  } catch (error) {
    console.error('记录登录日志错误:', error);
  }
};

// 获取用户信息
export const getUserById = async (userId) => {
  try {
    const result = await query(
      'SELECT id, username, email, nickname, avatar, status, created_at, updated_at FROM users WHERE id = ? AND status = 1',
      [userId]
    );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return null;
  }
};

// 获取系统配置
export const getSystemConfig = async (configKey) => {
  try {
    const result = await query('SELECT config_value FROM sys_config WHERE config_key = ?', [configKey]);
    return result.length > 0 ? result[0].config_value : null;
  } catch (error) {
    console.error('获取系统配置错误:', error);
    return null;
  }
};

// 检查IP是否在黑名单中
export const isIpBlacklisted = async (ipAddress) => {
  try {
    const blacklistConfig = await getSystemConfig('security.ip.blacklist');
    if (!blacklistConfig) {
      return false;
    }

    const blacklist = blacklistConfig.split(',').map(ip => ip.trim());
    
    // 检查精确匹配
    if (blacklist.includes(ipAddress)) {
      return true;
    }

    // 检查IP段匹配 (例如: 192.168.* 或 10.0.0.*)
    for (const blacklistedIp of blacklist) {
      if (blacklistedIp.endsWith('*')) {
        const prefix = blacklistedIp.slice(0, -1);
        if (ipAddress.startsWith(prefix)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('检查IP黑名单错误:', error);
    return false;
  }
};

// 更新用户密码
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows > 0) {
      return { success: true, message: '密码更新成功' };
    } else {
      return { success: false, message: '密码更新失败' };
    }
  } catch (error) {
    console.error('更新用户密码错误:', error);
    return { success: false, message: '密码更新服务异常' };
  }
};