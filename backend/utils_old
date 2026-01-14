import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import crypto from 'crypto';

// JWT密钥（在生产环境中应从环境变量获取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-change-in-production';

// 密码加密
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 生成JWT令牌
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// 验证JWT令牌
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

// 生成验证码
export const generateCaptcha = () => {
  const captcha = crypto.randomBytes(4).readUInt32BE(0) % 10000;
  return captcha.toString().padStart(4, '0');
};

// 验证密码强度
export const validatePassword = (password) => {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '5');
  const maxLength = parseInt(process.env.PASSWORD_MAX_LENGTH || '20');
  
  if (password.length < minLength) {
    return { valid: false, message: `密码长度不能少于${minLength}位` };
  }
  
  if (password.length > maxLength) {
    return { valid: false, message: `密码长度不能超过${maxLength}位` };
  }
  
  return { valid: true, message: '密码强度符合要求' };
};

// 验证用户名格式
export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { valid: false, message: '用户名长度不能少于3位' };
  }
  
  if (username.length > 50) {
    return { valid: false, message: '用户名长度不能超过50位' };
  }
  
  // 检查是否包含非法字符
  const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和中文字符' };
  }
  
  return { valid: true, message: '用户名格式正确' };
};