# Healing Audio AI - Backend Server

这是 Healing Audio AI 项目的后端服务器，提供用户认证、音频管理等 API 接口。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** - 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

## 功能特性

### 用户认证
- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT Token 认证
- ✅ 修改密码
- ✅ 获取当前用户信息

### 用户管理
- ✅ 查看用户资料
- ✅ 更新用户资料（用户名、头像、简介）
- ✅ 关注/取消关注用户
- ✅ 查看粉丝列表
- ✅ 查看关注列表

### 音频管理
- ✅ 创建音频
- ✅ 获取音频列表（支持分页、分类、搜索）
- ✅ 获取音频详情
- ✅ 更新音频信息
- ✅ 删除音频
- ✅ 点赞/取消点赞音频
- ✅ 获取推荐音频

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0

### 安装依赖

```bash
cd server
npm install
```

### 配置环境变量

复制 `.env.example` 文件为 `.env`，并根据实际情况修改配置：

```bash
cp .env.example .env
```

`.env` 文件配置项说明：

```env
# 服务器端口
PORT=5000

# 运行环境
NODE_ENV=development

# MongoDB 连接地址
MONGODB_URI=mongodb://localhost:27017/healing_audio_ai

# JWT 密钥（生产环境请修改为复杂的随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT 过期时间
JWT_EXPIRES_IN=7d

# 前端地址（用于 CORS 配置）
FRONTEND_URL=http://localhost:5173
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:5000` 启动。

### 构建生产版本

```bash
npm run build
npm start
```

## API 文档

### 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: Bearer Token (JWT)

### 认证接口

#### 注册用户
```
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 登录
```
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 获取当前用户信息
```
GET /auth/me
Authorization: Bearer <token>
```

#### 修改密码
```
PUT /auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### 用户接口

#### 获取用户资料
```
GET /users/:id
```

#### 更新用户资料
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "My bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 关注用户
```
POST /users/:id/follow
Authorization: Bearer <token>
```

#### 取消关注
```
DELETE /users/:id/follow
Authorization: Bearer <token>
```

#### 获取粉丝列表
```
GET /users/:id/followers
```

#### 获取关注列表
```
GET /users/:id/following
```

### 音频接口

#### 获取音频列表
```
GET /audio?category=meditation&search=relax&page=1&limit=20
```

#### 获取音频详情
```
GET /audio/:id
```

#### 创建音频
```
POST /audio
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Relaxing Music",
  "description": "A calming meditation track",
  "audioUrl": "https://example.com/audio.mp3",
  "coverImage": "https://example.com/cover.jpg",
  "duration": 300,
  "category": "meditation",
  "tags": ["relax", "meditation", "calm"],
  "isPublic": true
}
```

#### 更新音频
```
PUT /audio/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### 删除音频
```
DELETE /audio/:id
Authorization: Bearer <token>
```

#### 点赞/取消点赞
```
POST /audio/:id/like
Authorization: Bearer <token>
```

#### 获取推荐音频
```
GET /audio/recommended?limit=10
```

## 数据模型

### User (用户)
```typescript
{
  username: string;        // 用户名
  email: string;          // 邮箱
  password: string;       // 密码（加密）
  avatar?: string;        // 头像 URL
  bio?: string;           // 简介
  favoriteAudios: ObjectId[];   // 喜欢的音频
  createdAudios: ObjectId[];    // 创建的音频
  followers: ObjectId[];        // 粉丝
  following: ObjectId[];        // 关注
  createdAt: Date;
  updatedAt: Date;
}
```

### Audio (音频)
```typescript
{
  title: string;              // 标题
  description: string;        // 描述
  audioUrl: string;          // 音频 URL
  coverImage: string;        // 封面图 URL
  duration: number;          // 时长（秒）
  category: string;          // 分类
  tags: string[];            // 标签
  creator: ObjectId;         // 创建者
  likes: ObjectId[];         // 点赞用户
  listens: number;           // 播放次数
  isPublic: boolean;         // 是否公开
  createdAt: Date;
  updatedAt: Date;
}
```

## 错误处理

所有 API 错误响应格式：

```json
{
  "success": false,
  "error": "错误信息"
}
```

常见 HTTP 状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

## 项目结构

```
server/
├── src/
│   ├── controllers/       # 控制器
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── audio.controller.ts
│   ├── models/           # 数据模型
│   │   ├── User.model.ts
│   │   └── Audio.model.ts
│   ├── routes/           # 路由
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── audio.routes.ts
│   ├── middleware/       # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── validate.middleware.ts
│   ├── utils/            # 工具函数
│   │   └── ApiError.ts
│   └── index.ts          # 入口文件
├── package.json
├── tsconfig.json
└── .env.example
```

## 开发计划

- [ ] 文件上传功能（音频、图片）
- [ ] 邮箱验证
- [ ] 评论功能
- [ ] 播放列表功能
- [ ] 数据统计和分析
- [ ] 管理员后台
- [ ] API 限流
- [ ] 缓存优化

## 许可证

MIT
