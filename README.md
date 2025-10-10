# 抽根 (ChouGen)

> 一款香烟记录应用，帮助你追踪抽烟习惯和消费数据

## 项目简介

抽根是一款基于 Web 的 SPA 应用，适配 PC 和移动端。通过长按记录每次抽烟，管理口粮库存，查看统计数据，并与社区互动。

## 技术栈

### 核心框架
- **Next.js 14** - React 全栈框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全

### UI 和样式
- **Material UI (MUI) v5** - UI 组件库
- **Emotion** - CSS-in-JS
- **Tailwind CSS** - 工具类样式（辅助）

### 状态管理
- **Zustand** - 全局状态管理
- **TanStack Query** - 服务端状态和缓存

### 数据库和认证
- **Supabase** - PostgreSQL 数据库 + 认证 + 实时订阅
- **@supabase/ssr** - Next.js SSR 支持

### 动画和数据可视化
- **Framer Motion** - 页面和组件动画
- **Recharts** - 数据图表
- **Lottie** (计划中) - 复杂动画

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Zod** - 运行时验证

## 项目结构

```
ChouGen/
├── docs/                    # 设计文档
│   └── product-design.md    # 产品设计文档
├── public/                  # 静态资源
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/
│   │   ├── ui/             # UI 组件
│   │   ├── features/       # 业务组件
│   │   ├── layout/         # 布局组件
│   │   └── animations/     # 动画组件
│   ├── lib/
│   │   ├── supabase/       # Supabase 客户端
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── utils/          # 工具函数
│   │   └── validations/    # Zod schemas
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript 类型
│   └── theme/              # MUI 主题配置
├── supabase/               # Supabase 配置
│   └── migrations/         # 数据库迁移
└── ...
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase 和环境变量

**详细配置步骤请查看**: [docs/quick-setup.md](./docs/quick-setup.md)

简要步骤：
1. 创建 Supabase 项目
2. 运行数据库迁移 (`supabase/migrations/20250110000000_initial_schema.sql`)
3. 配置 `.env.local` 文件
4. （可选）申请 Linux.do OAuth 应用

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 主要功能

- **长按记录抽烟** - 通过长按按钮记录每次抽烟，附带动画效果
- **口粮仓库** - 管理购买的香烟，自动计算单支价格和剩余数量
- **数据统计** - 查看抽烟趋势、品牌分析、时间分布等
- **社区排行榜** - 查看抽烟排行，互相鼓励戒烟
- **多端适配** - 完美适配桌面端和移动端

## 开发进度

查看 [product-design.md](./docs/product-design.md) 了解详细的产品设计和开发路线图。

### Phase 1: 项目初始化 ✅
- [x] 创建 Next.js 项目
- [x] 安装依赖
- [x] 配置 MUI 主题
- [x] 配置 Supabase 客户端
- [x] 创建基础目录结构

### Phase 2: 认证系统 ✅
- [x] 实现邮箱登录/注册
- [x] 实现 Linux.do 一键登录
- [x] 数据库表设计和迁移
- [x] 登录/注册 UI 组件
- [ ] 用户资料编辑（待开发）

### Phase 3: 核心功能 (待开始)
- [ ] 长按抽烟按钮
- [ ] 口粮管理
- [ ] 统计页面
- [ ] 排行榜

## 设计原则

遵循**奥卡姆剃刀原理**：

- 保持代码简洁
- 避免过度工程
- 优先使用现有解决方案
- 不重复造轮子

## 健康声明

本应用旨在帮助用户了解自己的吸烟习惯，并鼓励减少吸烟和戒烟。

**吸烟有害健康，请尽早戒烟！**

## 许可证

MIT License

---

**Made with ❤️ by ChouGen Team**
