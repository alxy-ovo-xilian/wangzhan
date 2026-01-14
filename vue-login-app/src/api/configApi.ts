// 配置相关的API函数
export const configApi = {
  // 获取系统配置
  getConfig: async (key?: string) => {
    const token = localStorage.getItem('authToken');
    let url = 'http://localhost:3000/api/config';
    if (key) url += `/${key}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 更新系统配置
  updateConfig: async (key: string, value: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:3000/api/config/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    });
    return response.json();
  },

  // 添加系统配置
  addConfig: async (configData: { key: string; value: string; name: string; description: string; type: string; module: string }) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(configData),
    });
    return response.json();
  },

  // 按模块获取配置
  getConfigByModule: async (module: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:3000/api/config/module/${module}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 刷新配置缓存
  refreshConfigCache: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/config/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 获取配置详情
  getConfigDetails: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/config/details', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }
};