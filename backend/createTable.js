import pool from './db.js';

// 创建股票指数数据表
async function createTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS stock_index_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candle_end_time DATE NOT NULL,
      open DECIMAL(10, 3),
      high DECIMAL(10, 3),
      low DECIMAL(10, 3),
      close DECIMAL(10, 3),
      amount DECIMAL(20, 2),
      volume DECIMAL(20, 2),
      index_code VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_index_code (index_code),
      INDEX idx_date (candle_end_time),
      UNIQUE KEY unique_index_date (index_code, candle_end_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createTableSQL);
    console.log('✓ 数据表创建成功: stock_index_data');
    return true;
  } catch (error) {
    console.error('✗ 创建表失败:', error.message);
    return false;
  }
}

// 执行创建表
createTable().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('错误:', error);
  process.exit(1);
});
