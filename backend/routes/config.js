import express from 'express';
import { getConfig, updateConfig, addConfig, getConfigByModule, refreshConfigCache, getConfigDetails } from '../controllers/configController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 配置相关路由
router.get('/:key?', authenticateToken, getConfig);
router.put('/:key', authenticateToken, updateConfig);
router.post('/', authenticateToken, addConfig);
router.get('/module/:module', authenticateToken, getConfigByModule);
router.post('/refresh', authenticateToken, refreshConfigCache);
router.get('/details', authenticateToken, getConfigDetails);

export default router;