# 心语疗愈 - AI 心理疗愈音频平台

心语疗愈是一个 AI 驱动的心理疗愈音频 Web 应用，采用精致的玻璃态渐变设计风格。用户注册后通过对话式引导问卷建立个人档案，获取个性化的冥想、放松音频和定制疗愈方案。

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Vite | 5 | 构建工具 |
| React Router DOM | v6 | 路由管理 |
| Tailwind CSS | 3 | 样式方案 |
| Framer Motion | 10 | 动画引擎 |
| Zustand | 4 | 状态管理 |
| Lucide React | - | 图标库 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4 | Web 框架 |
| MongoDB + Mongoose | 8 | 数据库 |
| JWT | 9 | 身份认证 |
| bcryptjs | 2 | 密码加密 |
| express-validator | 7 | 请求校验 |
| Helmet + CORS | - | 安全中间件 |
| Morgan + Compression | - | 日志与压缩 |

## 项目结构

```
├── src/                        # 前端源码
│   ├── App.tsx                 # 根组件（路由 + Onboarding 守卫）
│   ├── main.tsx                # 入口
│   ├── index.css               # 全局样式 (Tailwind)
│   ├── components/             # 通用组件
│   │   ├── Layout.tsx          # 页面布局
│   │   ├── Header.tsx          # 顶部导航
│   │   ├── Navigation.tsx      # 底部 Tab 栏
│   │   ├── AuthModal.tsx       # 登录/注册弹窗
│   │   ├── AudioCard.tsx       # 音频卡片
│   │   ├── PlayerBar.tsx       # 底部播放栏
│   │   └── ...
│   ├── pages/                  # 页面
│   │   ├── Home.tsx            # 首页
│   │   ├── Onboarding.tsx      # 注册引导问卷（4步）
│   │   ├── Community.tsx       # 社区
│   │   ├── Create.tsx          # 创建选择
│   │   ├── SingleHealing.tsx   # 单次疗愈
│   │   ├── PlanHealing.tsx     # 规划疗愈
│   │   ├── Profile.tsx         # 个人中心
│   │   └── AudioPlayer.tsx     # 音频播放
│   ├── services/api.ts         # API 请求封装
│   ├── store/                  # Zustand 状态
│   │   ├── authStore.ts        # 认证状态
│   │   └── index.ts            # 应用状态
│   ├── types/index.ts          # 类型定义
│   └── utils/index.ts          # 工具函数
│
├── server/                     # 后端源码
│   ├── src/
│   │   ├── index.ts            # Express 入口
│   │   ├── controllers/        # 控制器
│   │   │   ├── auth.controller.ts   # 注册/登录/引导问卷
│   │   │   ├── user.controller.ts   # 用户资料/关注
│   │   │   └── audio.controller.ts  # 音频 CRUD
│   │   ├── models/             # Mongoose 模型
│   │   │   ├── User.model.ts   # 用户模型（含引导字段）
│   │   │   └── Audio.model.ts  # 音频模型
│   │   ├── routes/             # 路由定义
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.middleware.ts       # JWT 鉴权
│   │   │   ├── validation.middleware.ts # 请求校验规则
│   │   │   ├── validate.middleware.ts   # 校验执行器
│   │   │   └── error.middleware.ts      # 错误处理
│   │   └── utils/
│   │       └── ApiError.ts     # 业务错误类
│   ├── package.json
│   └── .env.example
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 快速开始

### 环境要求

- Node.js >= 18
- MongoDB >= 6（本地或云端）
- npm / yarn / pnpm

### 1. 克隆项目

```bash
git clone <repository-url>
cd emotion_planner_ai
```

### 2. 启动后端

```bash
cd server
cp .env.example .env        # 复制并编辑环境变量
npm install
npm run dev                  # 默认运行在 http://localhost:5000
```

`.env` 配置项：

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healing_audio_ai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 3. 启动前端

```bash
# 回到项目根目录
npm install
npm run dev                  # 默认运行在 http://localhost:3000
```

## API 接口文档

### 认证 (`/api/auth`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/register` | 用户注册 | 否 |
| POST | `/login` | 用户登录 | 否 |
| GET | `/me` | 获取当前用户 | 是 |
| PUT | `/password` | 修改密码 | 是 |
| POST | `/onboarding` | 完成注册引导问卷 | 是 |

#### 注册引导问卷 `POST /api/auth/onboarding`

注册后用户需完成的 4 步对话式问卷：

```json
{
  "nickname": "小明",
  "lifeStage": "student",
  "healingPreference": "warm",
  "motto": "每天都是新的开始"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 可选值 |
|------|------|------|--------|
| `nickname` | string | 是 | 最多 20 字符 |
| `lifeStage` | string | 是 | `student` / `career_start` / `career_mid` / `free_life` |
| `healingPreference` | string | 是 | `rational` / `warm` |
| `motto` | string | 否 | 最多 100 字符 |

### 用户 (`/api/users`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/:id` | 获取用户资料 | 否 |
| PUT | `/profile` | 更新个人资料 | 是 |
| POST | `/avatar` | 上传头像 | 是 |
| POST | `/:id/follow` | 关注用户 | 是 |
| DELETE | `/:id/follow` | 取消关注 | 是 |
| GET | `/:id/followers` | 获取粉丝列表 | 否 |
| GET | `/:id/following` | 获取关注列表 | 否 |

#### 头像上传 `POST /api/users/avatar`

支持用户上传自定义头像，使用 `multipart/form-data` 格式：

- **字段名**: `avatar`
- **支持格式**: JPG、PNG、GIF、WebP
- **文件大小**: 最大 5MB
- **存储位置**: `server/uploads/avatars/`
- **访问路径**: `http://localhost:5001/uploads/avatars/{filename}`

上传成功后会自动更新用户的 `avatar` 字段。

### 音频 (`/api/audio`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/` | 获取音频列表（支持分页/搜索/分类） | 否 |
| GET | `/recommended` | 获取推荐音频 | 否 |
| GET | `/:id` | 获取音频详情 | 否 |
| POST | `/` | 创建音频 | 是 |
| PUT | `/:id` | 更新音频 | 是 |
| DELETE | `/:id` | 删除音频 | 是 |
| POST | `/:id/like` | 点赞/取消点赞 | 是 |

## 核心功能

### 注册引导（Onboarding）

新用户注册后会进入 4 步对话式问卷：

1. **建立连接** — 输入昵称
2. **生命周期** — 选择当前人生阶段（求学探索期 / 职场适应期 / 中坚奋斗期 / 自由慢生活）
3. **疗愈偏好** — 选择理智重构或温暖抱持
4. **个人签名** — 可选填写座右铭

问卷数据用于后续个性化推荐和 AI 疗愈内容定制。登录时若未完成引导，会自动跳转至问卷页面。

### 单次疗愈

选择情绪状态、场景和强度，AI 生成个性化疗愈音频。

### 规划疗愈

通过多轮对话制定阶段性疗愈计划。

### 社区

浏览、搜索和发现其他用户分享的疗愈音频。

### 个人中心

管理个人资料、作品、收藏和疗愈计划。

## 前端路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/onboarding` | Onboarding | 注册引导问卷 |
| `/community` | Community | 社区 |
| `/create` | Create | 创建选择 |
| `/create/single` | SingleHealing | 单次疗愈 |
| `/create/plan` | PlanHealing | 规划疗愈 |
| `/profile` | Profile | 个人中心 |
| `/audio/:id` | AudioPlayer | 音频播放 |

## 数据模型

### User

```typescript
{
  username: string;             // 用户名（唯一）
  email: string;                // 邮箱（唯一）
  password: string;             // 密码（bcrypt 加密，查询不返回）
  avatar: string;               // 头像 URL
  bio: string;                  // 简介
  nickname: string;             // 昵称（引导问卷）
  lifeStage: enum;              // 生命周期（student/career_start/career_mid/free_life）
  healingPreference: enum;      // 疗愈偏好（rational/warm）
  motto: string;                // 个人签名
  onboardingCompleted: boolean; // 是否完成引导
  favoriteAudios: ObjectId[];
  createdAudios: ObjectId[];
  followers: ObjectId[];
  following: ObjectId[];
}
```

### Audio

```typescript
{
  title: string;
  description: string;
  audioUrl: string;
  coverImage: string;
  duration: number;
  category: enum;     // meditation/sleep/focus/relax/nature/music/other
  tags: string[];
  creator: ObjectId;
  likes: ObjectId[];
  listens: number;
  isPublic: boolean;
}
```

## 开发命令

```bash
# 前端
npm run dev        # 开发服务器 (localhost:3000)
npm run build      # 生产构建
npm run preview    # 预览构建
npm run lint       # 代码检查

# 后端
cd server
npm run dev        # 开发服务器 (localhost:5000)
npm run build      # 编译 TypeScript
npm start          # 运行编译后代码
```

## License

MIT
