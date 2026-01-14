// 应用程序配置
export const appConfig = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stock_data',
    port: process.env.DB_PORT || 3306
  },
  captcha: {
    length: 4,
    expireTime: 2 * 60 * 1000 // 2分钟
  },
  security: {
    maxLoginAttempts: 5,
    lockoutTime: 10 * 60 * 1000, // 10分钟
    ipBlacklist: process.env.IP_BLACKLIST?.split(',') || []
  }
};