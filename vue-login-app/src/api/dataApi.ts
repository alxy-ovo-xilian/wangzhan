// 数据相关的API函数
export const dataApi = {
  // 获取股票指数数据
  getStockIndexData: async (params?: { indexCode?: string; startTime?: string; endTime?: string; limit?: number }) => {
    let url = 'http://localhost:3000/api/data/stock-index-data';
    const queryParams = new URLSearchParams();
    
    if (params?.indexCode) queryParams.append('indexCode', params.indexCode);
    if (params?.startTime) queryParams.append('startTime', params.startTime);
    if (params?.endTime) queryParams.append('endTime', params.endTime);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // 获取所有股票指数代码
  getStockIndexCodes: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/data/stock-index-codes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }
};