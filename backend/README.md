# 后端服务器 - MySQL数据库连接

## 配置步骤

### 1. 配置数据库连接
编辑 `.env` 文件，填入你的MySQL数据库信息：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=你的数据库名称
DB_PORT=3306

PORT=3000
```

### 2. 启动服务器

```bash
cd backend
npm start
```

或者使用开发模式：
```bash
npm run dev
```

服务器将运行在 http://localhost:3000

## API接口

### 测试服务器
- **GET** `/`
- 返回服务器状态

### 测试数据库连接
- **GET** `/api/test-db`
- 测试MySQL数据库连接是否成功

### 查询数据示例
- **GET** `/api/data`
- 执行示例SQL查询

### 插入数据示例
- **POST** `/api/data`
- 插入数据到数据库（需要根据你的表结构修改）

## 项目结构

```
backend/
├── server.js       # Express服务器主文件
├── db.js          # 数据库连接配置
├── .env           # 环境变量配置
├── package.json   # 项目依赖
└── README.md      # 说明文档
```

## 技术栈

- **Express** - Web框架
- **MySQL2** - MySQL数据库驱动（支持Promise）
- **CORS** - 跨域资源共享
- **dotenv** - 环境变量管理

## 注意事项

1. 确保MySQL服务已启动
2. 确保数据库已创建
3. 确保`.env`文件中的数据库信息正确
4. `.env`文件已添加到`.gitignore`，不会被提交到版本控制
