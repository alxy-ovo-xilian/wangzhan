import { query } from '../db.js';

// 配置缓存
const configCache = new Map();
let lastUpdateTime = 0;

// 获取系统配置
export const getSystemConfig = async (configKey) => {
  try {
    // 检查缓存是否需要更新（每分钟更新一次）
    const now = Date.now();
    if (now - lastUpdateTime > 60000) {
      await refreshConfigCache();
      lastUpdateTime = now;
    }

    // 如果指定了特定配置键，返回该配置
    if (configKey) {
      return configCache.get(configKey) || null;
    }

    // 否则返回所有配置
    return Object.fromEntries(configCache);
  } catch (error) {
    console.error('获取系统配置失败:', error);
    return null;
  }
};

// 刷新配置缓存
export const refreshConfigCache = async () => {
  try {
    const results = await query('SELECT config_key, config_value FROM sys_config');
    
    // 清空旧缓存
    configCache.clear();
    
    // 填充新配置
    results.forEach(row => {
      configCache.set(row.config_key, row.config_value);
    });
  } catch (error) {
    console.error('刷新配置缓存失败:', error);
  }
};

// 更新系统配置
export const updateSystemConfig = async (configKey, configValue) => {
  try {
    const result = await query(
      'UPDATE sys_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?',
      [configValue, configKey]
    );

    if (result.affectedRows > 0) {
      // 更新缓存
      configCache.set(configKey, configValue);
      return { success: true, message: '配置更新成功' };
    } else {
      return { success: false, message: '配置键不存在' };
    }
  } catch (error) {
    console.error('更新系统配置失败:', error);
    return { success: false, message: '更新配置失败' };
  }
};

// 添加新的系统配置
export const addSystemConfig = async (configKey, configValue, configName, configDesc, configType = 'string', moduleName = null) => {
  try {
    const result = await query(
      'INSERT INTO sys_config (config_key, config_value, config_name, config_desc, config_type, module_name) VALUES (?, ?, ?, ?, ?, ?)',
      [configKey, configValue, configName, configDesc, configType, moduleName]
    );

    if (result.affectedRows > 0) {
      // 更新缓存
      configCache.set(configKey, configValue);
      return { success: true, message: '配置添加成功' };
    } else {
      return { success: false, message: '配置添加失败' };
    }
  } catch (error) {
    console.error('添加系统配置失败:', error);
    return { success: false, message: '添加配置失败' };
  }
};

// 批量获取配置（按模块）
export const getConfigByModule = async (moduleName) => {
  try {
    const results = await query(
      'SELECT config_key, config_value, config_name, config_desc FROM sys_config WHERE module_name = ?',
      [moduleName]
    );

    const moduleConfig = {};
    results.forEach(row => {
      moduleConfig[row.config_key] = row.config_value;
    });

    return { success: true, data: moduleConfig };
  } catch (error) {
    console.error('获取模块配置失败:', error);
    return { success: false, message: '获取配置失败' };
  }
};