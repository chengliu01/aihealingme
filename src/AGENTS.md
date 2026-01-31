# 心语疗愈 - AI 心理疗愈音频平台

## 项目概述

心语疗愈是一个现代化的 AI 驱动心理疗愈音频 Web 应用。用户可以获取个性化的冥想、放松音频和定制疗愈方案。

**核心定位**：专注于音频疗愈，类似网易云音乐的心理健康版本

**项目类型**: React 单页应用 (SPA)
**主要语言**: TypeScript
**用户界面**: 中文

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router DOM v6
- **样式**: Tailwind CSS 3
- **动画**: Framer Motion
- **状态管理**: Zustand (持久化存储)
- **图标**: Lucide React
- **工具类**: clsx + tailwind-merge
- **日期处理**: date-fns

## 项目结构

```
.
├── index.html              # HTML 入口
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Vite 的 TypeScript 配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── postcss.config.js       # PostCSS 配置
├── public/                 # 静态资源
│   └── logo.svg
├── src/
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 根组件（路由配置）
│   ├── vite-env.d.ts       # Vite 类型声明
│   ├── index.css           # 全局样式
│   ├── types/index.ts      # TypeScript 类型定义
│   ├── store/index.ts      # Zustand 状态管理
│   ├── utils/index.ts      # 工具函数
│   ├── components/         # 可复用组件
│   │   ├── Layout.tsx      # 页面布局（含背景动画）
│   │   ├── Header.tsx      # 顶部导航栏
│   │   ├── Navigation.tsx  # 底部导航栏 + 迷你播放器
│   │   ├── AudioCard.tsx   # 音频卡片组件（音乐播放器风格）
│   │   └── FloatingBubbles.tsx  # 背景浮动光晕
│   └── pages/              # 页面组件
│       ├── Home.tsx        # 首页（情绪气泡 + 核心功能入口）
│       ├── Community.tsx   # 社区页（音频发现）
│       ├── Create.tsx      # 创建选择页
│       ├── SingleHealing.tsx    # 单次疗愈
│       ├── PlanHealing.tsx      # 计划疗愈
│       ├── Profile.tsx          # 个人中心
│       └── AudioPlayer.tsx      # 音频播放器（网易云风格）
```

## 核心功能模块

### 1. 单次疗愈 (SingleHealing)
- 情绪状态多选（胶囊按钮）
- 场景选择
- 情绪强度滑块（带渐变填充）
- AI 分析和音频生成流程

### 2. 计划疗愈 (PlanHealing)
- 聊天式多轮对话
- 阶段性疗愈计划预览
- 计划进度追踪

### 3. 社区功能 (Community)
- 音频卡片流展示（网易云风格封面）
- 分类筛选和搜索
- 排序功能（热门/最新/最受欢迎）

### 4. 音频播放器 (AudioPlayer)
- 大背景图片 + 毛玻璃效果
- 音频波形可视化
- 播放控制（播放/暂停、进度条、音量等）
- 播放列表侧边栏
- 评论互动功能

### 5. 个人中心 (Profile)
- 用户信息和统计
- 我的作品管理（音频列表）
- 收藏列表
- 疗愈计划追踪

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 代码风格指南

### 命名规范
- **组件**: PascalCase (如 `AudioCard.tsx`)
- **工具函数**: camelCase (如 `formatDuration`)
- **类型/接口**: PascalCase (如 `HealingAudio`)
- **常量**: 大写下划线 (如 `emotionOptions`)

### 导入顺序
1. React 相关
2. 第三方库
3. 内部组件 (@/components)
4. 状态管理 (@/store)
5. 工具函数 (@/utils)
6. 类型定义 (@/types)

### 样式规范
- 使用 Tailwind CSS 工具类
- 自定义样式定义在 `index.css` 的 `@layer components` 中
- 常用类：
  - `.glass` - 玻璃态效果
  - `.btn-primary` / `.btn-secondary` - 按钮样式
  - `.card` - 卡片样式
  - `.input-clean` - 输入框样式

### 动画规范
- 使用 Framer Motion 进行组件动画
- 页面切换使用 `AnimatePresence` + `motion.div`
- 常见动画模式：
  - 入场: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
  - 悬停: `whileHover={{ scale: 1.02 }}`
  - 点击: `whileTap={{ scale: 0.98 }}`

## 状态管理 (Zustand)

Store 包含以下状态切片：

- **用户状态**: `currentUser`, `isAuthenticated`
- **音频状态**: `audios`, `myAudios`, `favoriteAudios`, `currentlyPlaying`, `isPlaying`
- **计划状态**: `plans`, `currentPlan`
- **请求状态**: `currentRequest`
- **聊天状态**: `chatMessages`

使用 `persist` 中间件持久化存储到 localStorage。

## 类型定义

核心类型位于 `src/types/index.ts`：

- `User` - 用户信息
- `HealingAudio` - 疗愈音频（替代原来的 HealingVideo）
- `HealingPlan` - 疗愈计划
- `PlanStage` - 计划阶段
- `HealingRequest` - 疗愈请求
- `AIAnalysis` - AI 分析结果
- `Comment` - 评论
- `ChatMessage` - 聊天消息

## 路由结构

```
/                    -> Home (首页)
/community           -> Community (社区)
/create              -> Create (创建选择)
/create/single       -> SingleHealing (单次疗愈)
/create/plan         -> PlanHealing (规划疗愈)
/profile             -> Profile (个人中心)
/audio/:id           -> AudioPlayer (音频播放器)
```

## 设计系统

### 颜色方案
- **主色调**: 紫罗兰渐变系 (violet-500 to purple-500)
- **背景**: 柔和蓝色渐变 (sky/cyan/blue 系)
- **中性色**: neutral-50 到 neutral-900
- **强调色**: rose, cyan, amber 系列

### 设计特点
1. **情绪共鸣首页** - 情绪困扰气泡设计
2. **音乐播放器风格** - 网易云风格的音频卡片和播放器
3. **玻璃态设计 (Glassmorphism)** - 半透明毛玻璃卡片
4. **圆角设计** - 大量使用 rounded-2xl, rounded-3xl

### 响应式断点
Tailwind 默认断点：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 模拟数据

项目中使用模拟数据：
- `mockUser` - 当前登录用户
- `mockAudios` - 示例音频列表（8 条）

## 构建和部署

### 构建输出
- 构建目录: `dist/`
- 包含静态资源、JS、CSS

### 环境要求
- Node.js 18+
- npm 或兼容包管理器

## 注意事项

1. **AI 功能为模拟** - 当前 AI 分析和生成为模拟流程，非真实 AI 接口调用
2. **无后端 API** - 所有数据存储在本地 Zustand + localStorage
3. **图片使用外部 URL** - 使用 Unsplash 和 Dicebear 提供的图片服务
4. **无真实音频播放** - 音频播放器为 UI 展示，无实际音频文件

## 扩展建议

如需添加新功能：
1. 在 `src/types/index.ts` 添加类型定义
2. 在 `src/store/index.ts` 添加状态和方法
3. 在 `src/pages/` 创建新页面组件
4. 在 `src/App.tsx` 添加路由
5. 在 `src/components/` 创建可复用组件

## 依赖升级注意事项

- React 18 使用 `ReactDOM.createRoot`
- React Router v6 使用新 API (`useNavigate`, `useParams`)
- Tailwind CSS 3 使用 JIT 模式
- Vite 5 可能需要 Node.js 18+
