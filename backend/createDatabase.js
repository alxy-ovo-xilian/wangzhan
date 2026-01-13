import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // 先连接到MySQL服务器（不指定数据库）
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    const dbName = process.env.DB_NAME || 'stock_data';
    
    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✓ 数据库创建成功: ${dbName}`);
    
  } catch (error) {
    console.error('✗ 创建数据库失败:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase();
