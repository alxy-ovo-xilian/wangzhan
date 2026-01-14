import { query } from './db.js';

// 更新配置表结构
const updateConfigTable = async () => {
  try {
    console.log('开始更新配置表结构...');
    
    // 添加 module_name 和 editable 字段
    await query(`
      ALTER TABLE sys_config 
      ADD COLUMN IF NOT EXISTS module_name VARCHAR(50),
      ADD COLUMN IF NOT EXISTS editable BOOLEAN DEFAULT TRUE
    `);
    
    console.log('✓ 配置表结构更新成功');
  } catch (error) {
    console.error('更新配置表结构失败:', error);
  }
};

updateConfigTable();