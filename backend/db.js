import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ 数据库连接成功！');
    console.log(`✓ 连接到数据库: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询
export async function query(sql, params) {
  try {
    // 确保params是一个数组，如果未定义则设为空数组
    let queryParams = params;
    if (!queryParams) {
      queryParams = [];
    } else if (!Array.isArray(queryParams)) {
      // 如果params不是数组，将其转换为数组
      queryParams = [queryParams];
    }
    
    console.log(`执行SQL: ${sql}, 参数:`, queryParams); // 调试信息
    
    const [results] = await pool.execute(sql, queryParams);
    return results;
  } catch (error) {
    console.error('查询错误:', error);
    console.error('出错的SQL:', sql);
    console.error('出错的参数:', params);
    throw error;
  }
}

export default pool;