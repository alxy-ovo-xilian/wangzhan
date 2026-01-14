# 模块化架构文档

## 项目结构

### 后端 (backend/)
```
backend/
├── config/                 # 配置文件
│   └── app.js             # 应用程序配置
├── controllers/           # 控制器层
│   ├── authController.js  # 认证控制器
│   ├── dataController.js  # 数据控制器
│   └── configController.js # 配置控制器
├── models/                # 数据模型层
├── routes/                # 路由定义
│   ├── auth.js            # 认证路由
│   ├── data.js            # 数据路由
│   └── config.js          # 配置路由
├── services/              # 业务逻辑层
│   ├── userService.js     # 用户服务
│   └── configService.js   # 配置服务
├── utils/                 # 工具函数
│   ├── auth.js            # 认证工具
│   └── captcha.js         # 验证码工具
├── middleware/            # 中间件
│   └── auth.js            # 认证中间件
├── server-modular.js      # 模块化服务器入口
└── server.js              # 原始服务器文件
```

### 前端 (vue-login-app/src/)
```
vue-login-app/src/
├── api/                   # API 接口层
│   ├── authApi.ts         # 认证 API
│   ├── dataApi.ts         # 数据 API
│   └── configApi.ts       # 配置 API
├── composables/          # 组合式 API 函数
├── store/                # 状态管理
├── types/                # 类型定义
├── utils/                # 工具函数
├── components/           # 公共组件
├── views/                # 页面视图
├── router/               # 路由配置
└── main.ts               # 应用入口
```

## 架构优势

### 1. 模块化设计
- **分离关注点**: 每个模块负责特定功能
- **易于维护**: 修改一个模块不影响其他模块
- **可扩展性**: 轻松添加新功能模块

### 2. 分层架构
- **控制器层**: 处理 HTTP 请求和响应
- **服务层**: 实现业务逻辑
- **数据访问层**: 处理数据库操作

### 3. 配置管理
- **集中配置**: 所有配置项集中管理
- **动态配置**: 支持运行时配置修改
- **模块化配置**: 按功能模块分类配置

### 4. 安全性
- **JWT 认证**: 无状态用户认证
- **验证码**: 防止自动化攻击
- **IP 黑名单**: 阻止恶意访问

## API 路由结构

### 认证模块 (`/api/auth`)
- `POST /login` - 用户登录
- `POST /register` - 用户注册
- `POST /logout` - 用户登出
- `GET /profile` - 获取用户资料

### 数据模块 (`/api/data`)
- `GET /stock-index-data` - 获取股票指数数据
- `GET /stock-index-codes` - 获取股票指数代码

### 配置模块 (`/api/config`)
- `GET /:key?` - 获取配置
- `PUT /:key` - 更新配置
- `POST /` - 添加配置
- `GET /module/:module` - 按模块获取配置
- `POST /refresh` - 刷新配置缓存
- `GET /details` - 获取配置详情

## 部署指南

### 后端启动
```bash
# 启动模块化服务器
cd backend
node server-modular.js

# 或启动原始服务器
node server.js
```

### 前端启动
```bash
cd vue-login-app
npm run dev
```

## 维护指南

### 添加新功能模块
1. 在 `controllers/` 创建控制器
2. 在 `services/` 创建服务
3. 在 `routes/` 定义路由
4. 在前端 `api/` 添加 API 调用

### 配置管理
- 所有配置项通过 `/api/config` 端点管理
- 支持运行时动态修改配置
- 配置修改后自动刷新缓存

### 安全考虑
- 定期更新依赖包
- 验证所有输入参数
- 监控异常访问行为
- 定期审查权限配置