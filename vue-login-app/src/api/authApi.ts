import { ref } from 'vue';

// 认证相关的API函数
export const authApi = {
  // 用户登录
  login: async (credentials: { username: string; password: string; captcha?: string; captchaId?: string }) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // 用户注册
  register: async (userData: { username: string; email: string; password: string; nickname: string; captcha?: string; captchaId?: string }) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // 用户登出
  logout: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 获取用户资料
  getUserProfile: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 获取验证码
  getCaptcha: async () => {
    const response = await fetch('http://localhost:3000/api/captcha', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};