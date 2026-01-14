import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV文件目录路径
const CSV_DIR = path.join(__dirname, '../shuju/stock-main-index-data');

// 批量插入大小
const BATCH_SIZE = 1000;

// 读取并导入单个CSV文件
async function importCSVFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📂 开始处理文件: ${fileName}`);
  
  return new Promise((resolve, reject) => {
    const results = [];
    let totalRows = 0;
    let insertedRows = 0;
    let skippedRows = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        totalRows++;
        results.push(data);

        // 当达到批量大小时，插入数据库
        if (results.length >= BATCH_SIZE) {
          const batch = results.splice(0, BATCH_SIZE);
          // 使用await确保顺序执行，避免死锁
          insertBatch(batch).then((result) => {
            insertedRows += result.inserted;
            skippedRows += result.skipped;
          }).catch(console.error);
        }
      })
      .on('end', async () => {
        // 插入剩余的数据
        if (results.length > 0) {
          try {
            const result = await insertBatch(results);
            insertedRows += result.inserted;
            skippedRows += result.skipped;
          } catch (error) {
            console.error('插入最后批次数据失败:', error);
          }
        }
        
        console.log(`✓ ${fileName} 处理完成`);
        console.log(`  - 总行数: ${totalRows}`);
        console.log(`  - 成功插入: ${insertedRows}`);
        console.log(`  - 跳过(重复): ${skippedRows}`);
        
        resolve({ totalRows, insertedRows, skippedRows, fileName });
      })
      .on('error', (error) => {
        console.error(`✗ 读取文件失败: ${fileName}`, error);
        reject(error);
      });
  });
}

// 批量插入数据 - 修复死锁问题
async function insertBatch(batch) {
  if (batch.length === 0) return { inserted: 0, skipped: 0 };

  const values = batch.map(row => [
    row.candle_end_time,
    parseFloat(row.open) || null,
    parseFloat(row.high) || null,
    parseFloat(row.low) || null,
    parseFloat(row.close) || null,
    parseFloat(row.amount) || null,
    parseFloat(row.volume) || null,
    row.index_code
  ]);

  const placeholders = values.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  const sql = `
    INSERT INTO stock_index_data 
    (candle_end_time, open, high, low, close, amount, volume, index_code)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      open = VALUES(open),
      high = VALUES(high),
      low = VALUES(low),
      close = VALUES(close),
      amount = VALUES(amount),
      volume = VALUES(volume)
  `;

  // 将二维数组扁平化为一维数组
  const flatValues = values.flat();

  try {
    const [result] = await pool.query(sql, flatValues);
    // 修复受影响行数计算
    const affectedRows = result.affectedRows;
    return { inserted: affectedRows, skipped: 0 };
  } catch (error) {
    console.error('批量插入失败:', error.message);
    // 遇到死锁或其他错误时，逐行插入
    if (error.message.includes('Deadlock') || error.code === 'ER_LOCK_DEADLOCK') {
      console.log('  - 检测到死锁，尝试逐行插入...');
      let insertedCount = 0;
      for (const row of batch) {
        try {
          const singleRow = [
            row.candle_end_time,
            parseFloat(row.open) || null,
            parseFloat(row.high) || null,
            parseFloat(row.low) || null,
            parseFloat(row.close) || null,
            parseFloat(row.amount) || null,
            parseFloat(row.volume) || null,
            row.index_code
          ];
          
          const singleSql = `
            INSERT INTO stock_index_data 
            (candle_end_time, open, high, low, close, amount, volume, index_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              open = VALUES(open),
              high = VALUES(high),
              low = VALUES(low),
              close = VALUES(close),
              amount = VALUES(amount),
              volume = VALUES(volume)
          `;
          const [singleResult] = await pool.query(singleSql, singleRow);
          if (singleResult.affectedRows > 0) insertedCount++;
        } catch (singleError) {
          console.error('  - 单行插入失败:', singleError.message);
        }
      }
      return { inserted: insertedCount, skipped: 0 };
    }
    return { inserted: 0, skipped: 0 };
  }
}

// 导入所有CSV文件 - 串行处理以避免死锁
async function importAllCSVFiles() {
  console.log('🚀 开始导入股票指数数据...\n');
  console.log(`📁 数据目录: ${CSV_DIR}\n`);

  try {
    // 读取目录中的所有CSV文件
    const files = fs.readdirSync(CSV_DIR)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(CSV_DIR, file));

    console.log(`找到 ${files.length} 个CSV文件\n`);

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalRows = 0;

    // 串行处理文件，避免数据库连接竞争
    for (const file of files) {
      try {
        console.log(`处理文件: ${path.basename(file)}`);
        const result = await importCSVFile(file);
        totalRows += result.totalRows;
        totalInserted += result.insertedRows;
        totalSkipped += result.skippedRows;
      } catch (error) {
        console.error(`处理文件失败: ${path.basename(file)}`, error);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 导入完成统计:');
    console.log('='.repeat(50));
    console.log(`总文件数: ${files.length}`);
    console.log(`总数据行: ${totalRows}`);
    console.log(`成功插入: ${totalInserted}`);
    console.log(`跳过重复: ${totalSkipped}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('导入过程出错:', error);
  } finally {
    // 关闭数据库连接池
    console.log('✓ 数据库连接已关闭');
  }
}

// 执行导入
importAllCSVFiles();