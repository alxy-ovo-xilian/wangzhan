import express from 'express';
import { login, register, logout, getUserProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 认证相关路由
router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getUserProfile);

export default router;