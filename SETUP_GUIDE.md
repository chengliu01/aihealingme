# 完整后端系统部署指南

## 项目概览

本项目已经创建了一个完整的后端系统，包括：

### 后端功能 ✅
- **用户认证系统**
  - 用户注册（用户名、邮箱、密码）
  - 用户登录（JWT Token）
  - 密码加密（bcryptjs）
  - 获取当前用户信息
  - 修改密码

- **用户管理**
  - 查看用户资料
  - 更新用户资料（用户名、头像、简介）
  - 关注/取消关注用户
  - 查看粉丝和关注列表

- **音频管理**
  - 创建音频
  - 获取音频列表（分页、分类、搜索）
  - 获取音频详情
  - 更新/删除音频
  - 点赞/取消点赞音频
  - 获取推荐音频

### 前端功能 ✅
- 登录/注册页面
- API 服务封装
- 用户认证状态管理
- Header 组件集成登录状态

## 快速启动

### 1. 安装 MongoDB

#### macOS (使用 Homebrew):
```bash
# 安装 MongoDB
brew tap mongodb/brew
brew install mongodb-community@8.0

# 启动 MongoDB
brew services start mongodb-community@8.0

# 验证 MongoDB 是否运行
mongosh
```

#### 或使用 Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:8.0
```

### 2. 启动后端服务器

```bash
cd server

# 已安装依赖，如需重新安装
npm install

# 复制环境变量文件（已创建 .env）
# 可根据需要修改 server/.env 文件
npm run dev
```

后端服务器将在 `http://localhost:5001` 启动

### 3. 启动前端应用

在另一个终端：

```bash
# 回到项目根目录
cd /Users/liucheng/Desktop/xhs-claude-code/emotion_ai/emotion_planner_ai

# 启动前端开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

## 测试后端 API

### 使用 curl 测试

#### 1. 注册用户
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 2. 登录
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

保存返回的 token，在后续请求中使用：

#### 3. 获取当前用户信息
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. 创建音频
```bash
curl -X POST http://localhost:5000/api/audio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "放松冥想音乐",
    "description": "帮助你放松身心的冥想音乐",
    "audioUrl": "https://example.com/audio.mp3",
    "coverImage": "https://example.com/cover.jpg",
    "duration": 300,
    "category": "meditation",
    "tags": ["放松", "冥想"],
    "isPublic": true
  }'
```

## 项目结构

```
emotion_planner_ai/
├── server/                    # 后端服务器
│   ├── src/
│   │   ├── controllers/       # 控制器（业务逻辑）
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── audio.controller.ts
│   │   ├── models/           # 数据模型
│   │   │   ├── User.model.ts
│   │   │   └── Audio.model.ts
│   │   ├── routes/           # 路由定义
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── audio.routes.ts
│   │   ├── middleware/       # 中间件
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── utils/            # 工具函数
│   │   │   └── ApiError.ts
│   │   └── index.ts          # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # 环境变量
│   └── README.md
│
├── src/                      # 前端应用
│   ├── pages/
│   │   └── Auth.tsx          # 登录/注册页面
│   ├── services/
│   │   └── api.ts            # API 服务封装
│   ├── store/
│   │   └── authStore.ts      # 认证状态管理
│   └── ...
│
└── SETUP_GUIDE.md            # 本文件
```

## 数据库模型

### User (用户)
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password: 密码（加密存储）
- avatar: 头像 URL
- bio: 个人简介
- favoriteAudios: 收藏的音频
- createdAudios: 创建的音频
- followers: 粉丝列表
- following: 关注列表

### Audio (音频)
- title: 标题
- description: 描述
- audioUrl: 音频 URL
- coverImage: 封面图 URL
- duration: 时长（秒）
- category: 分类（meditation, sleep, focus, relax, nature, music, other）
- tags: 标签数组
- creator: 创建者
- likes: 点赞用户列表
- listens: 播放次数
- isPublic: 是否公开

## 环境变量配置

### 后端 (server/.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healing_audio_ai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 前端 (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API 端点总览

### 认证相关
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户（需要认证）
- PUT `/api/auth/password` - 修改密码（需要认证）

### 用户相关
- GET `/api/users/:id` - 获取用户资料
- PUT `/api/users/profile` - 更新用户资料（需要认证）
- POST `/api/users/:id/follow` - 关注用户（需要认证）
- DELETE `/api/users/:id/follow` - 取消关注（需要认证）
- GET `/api/users/:id/followers` - 获取粉丝列表
- GET `/api/users/:id/following` - 获取关注列表

### 音频相关
- POST `/api/audio` - 创建音频（需要认证）
- GET `/api/audio` - 获取音频列表
- GET `/api/audio/:id` - 获取音频详情
- PUT `/api/audio/:id` - 更新音频（需要认证）
- DELETE `/api/audio/:id` - 删除音频（需要认证）
- POST `/api/audio/:id/like` - 点赞/取消点赞（需要认证）
- GET `/api/audio/recommended` - 获取推荐音频

## 使用前端测试

1. 访问 `http://localhost:5173/auth` 进入登录/注册页面
2. 注册一个新账户
3. 登录后会自动跳转到首页
4. 右上角会显示用户头像和下拉菜单

## 常见问题

### MongoDB 连接失败
- 确保 MongoDB 服务正在运行
- 检查 `server/.env` 中的 `MONGODB_URI` 配置是否正确

### 跨域问题
- 确保后端的 CORS 配置正确
- 检查 `server/.env` 中的 `FRONTEND_URL` 是否与前端地址匹配

### Token 失效
- JWT Token 默认有效期为 7 天
- 可在 `server/.env` 中修改 `JWT_EXPIRES_IN`

## 下一步开发建议

1. **文件上传功能**
   - 集成云存储服务（AWS S3、阿里云 OSS）
   - 实现音频和图片上传

2. **邮箱验证**
   - 集成邮件服务（SendGrid、阿里云邮件）
   - 实现注册邮箱验证

3. **社交功能**
   - 评论系统
   - 分享功能
   - 私信功能

4. **数据分析**
   - 用户行为统计
   - 音频播放统计
   - 管理员后台

5. **性能优化**
   - Redis 缓存
   - CDN 加速
   - 数据库索引优化

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密

### 前端
- React + TypeScript
- Vite
- React Router
- Zustand 状态管理
- Framer Motion 动画
- Tailwind CSS

## 许可证

MIT
