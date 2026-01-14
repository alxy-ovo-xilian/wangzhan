import { query } from '../db.js';

// 获取股票指数数据
export const getStockIndexData = async (req, res) => {
  try {
    const { indexCode, startTime, endTime, limit = 100 } = req.query;
    
    // 验证并限制limit值，防止SQL注入
    let limitValue = parseInt(limit, 10);
    if (isNaN(limitValue) || limitValue <= 0) {
      limitValue = 100;
    } else if (limitValue > 1000) {
      limitValue = 1000; // 设置最大限制
    }
    
    let sql = 'SELECT * FROM stock_index_data';
    const params = [];
    
    // 构建WHERE条件
    let whereConditions = [];
    
    if (indexCode) {
      whereConditions.push('index_code = ?');
      params.push(indexCode);
    }
    
    if (startTime && endTime) {
      whereConditions.push('candle_end_time BETWEEN ? AND ?');
      params.push(startTime, endTime);
    } else if (startTime) {
      whereConditions.push('candle_end_time >= ?');
      params.push(startTime);
    } else if (endTime) {
      whereConditions.push('candle_end_time <= ?');
      params.push(endTime);
    }
    
    // 添加WHERE子句
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // 直接在SQL中使用经过验证的limit值，而不是参数绑定
    sql += ' ORDER BY candle_end_time DESC LIMIT ' + limitValue;
    
    const results = await query(sql, params);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('获取股票指数数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
};

// 获取所有股票指数代码
export const getStockIndexCodes = async (req, res) => {
  try {
    const results = await query('SELECT DISTINCT index_code FROM stock_index_data ORDER BY index_code');
    
    res.json({
      success: true,
      data: results.map(row => ({ index_code: row.index_code }))
    });
  } catch (error) {
    console.error('获取股票指数代码错误:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
};