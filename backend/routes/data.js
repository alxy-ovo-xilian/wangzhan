import express from 'express';
import { getStockIndexData, getStockIndexCodes } from '../controllers/dataController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 数据相关路由
router.get('/stock-index-data', getStockIndexData);
router.get('/stock-index-codes', getStockIndexCodes);

export default router;