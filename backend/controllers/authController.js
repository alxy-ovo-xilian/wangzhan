import { loginService, registerService, isIpBlacklisted, getUserById } from '../services/userService.js';
import { generateToken } from '../utils/auth.js';
import { verifyCaptcha, isCaptchaEnabled } from '../utils/captcha.js';

// 用户登录
export const login = async (req, res) => {
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
};

// 用户注册
export const register = async (req, res) => {
  try {
    const { username, email, password, nickname, captcha, captchaId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

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
    const registerResult = await registerService(username, email, password, nickname, ipAddress);

    res.status(registerResult.success ? 200 : 400).json(registerResult);
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册服务异常'
    });
  }
};

// 用户注销
export const logout = async (req, res) => {
  try {
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
};

// 获取用户资料
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // 从JWT token解析的用户ID
    
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 移除敏感信息
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败'
    });
  }
};