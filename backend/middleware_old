import { verifyToken } from '../utils/auth.js';
import { query } from '../db.js';

// JWT认证中间件
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    
    // 检查用户是否存在且状态正常
    const userResult = await query(
      'SELECT id, username, email, nickname, status FROM users WHERE id = ? AND status = 1',
      [decoded.userId]
    );

    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    req.user = userResult[0];
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

// 管理员权限中间件
export const requireAdmin = (req, res, next) => {
  // 这里可以检查用户角色
  // 暂时简单实现，后续可根据实际需求扩展
  if (req.user && req.user.username === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
};