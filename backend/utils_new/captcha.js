import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';

// 存储验证码的内存缓存（实际生产环境中应使用Redis）
const captchaCache = new Map();

// 获取系统配置
const getSystemConfig = async (configKey) => {
  try {
    const result = await query('SELECT config_value FROM sys_config WHERE config_key = ?', [configKey]);
    return result.length > 0 ? result[0].config_value : null;
  } catch (error) {
    console.error('获取系统配置失败:', error);
    return null;
  }
};

// 生成验证码
export const generateCaptcha = async () => {
  // 生成4位数字验证码
  const captcha = Math.floor(Math.random() * 9000 + 1000).toString();
  // 生成UUID作为验证码标识
  const uuid = uuidv4();
  
  // 获取验证码有效期（默认2分钟）
  const expiryMinutes = parseInt(await getSystemConfig('captcha.expiry.minutes') || '2');
  const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  // 存储验证码到缓存
  captchaCache.set(uuid, {
    code: captcha,
    expiryTime: expiryTime,
    createdAt: new Date()
  });
  
  // 设置定时清理过期验证码
  setTimeout(() => {
    captchaCache.delete(uuid);
  }, expiryMinutes * 60 * 1000);
  
  return {
    uuid,
    captcha,
    expiryTime
  };
};

// 验证验证码
export const verifyCaptcha = async (uuid, userInput) => {
  const cached = captchaCache.get(uuid);
  
  if (!cached) {
    return { valid: false, message: '验证码已失效或不存在' };
  }
  
  if (new Date() > cached.expiryTime) {
    captchaCache.delete(uuid);
    return { valid: false, message: '验证码已过期' };
  }
  
  if (cached.code.toLowerCase() !== userInput.toLowerCase()) {
    return { valid: false, message: '验证码错误' };
  }
  
  // 验证成功后删除验证码（防止重复使用）
  captchaCache.delete(uuid);
  
  return { valid: true, message: '验证码验证成功' };
};

// 检查是否启用验证码
export const isCaptchaEnabled = async () => {
  const enabled = await getSystemConfig('login.captcha.enabled');
  return enabled === 'true' || enabled === true;
};