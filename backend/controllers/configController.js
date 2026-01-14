import { getSystemConfig, updateSystemConfig, addSystemConfig, getConfigByModule as getServiceConfigByModule, refreshConfigCache as serviceRefreshConfigCache } from '../services/configService.js';

// 获取系统配置
export const getConfig = async (req, res) => {
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
};

// 更新系统配置
export const updateConfig = async (req, res) => {
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
};

// 添加系统配置
export const addConfig = async (req, res) => {
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
};

// 按模块获取配置
export const getConfigByModule = async (req, res) => {
  try {
    const { module } = req.params;
    
    const result = await getServiceConfigByModule(module);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 刷新配置缓存
export const refreshConfigCache = async (req, res) => {
  try {
    await serviceRefreshConfigCache();
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
};

// 获取配置详情（包含元数据）
export const getConfigDetails = async (req, res) => {
  try {
    const { query } = await import('../db.js');
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
};