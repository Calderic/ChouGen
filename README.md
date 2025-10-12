<div align="center">

# 🚬 抽根 ChouGen

**记录每一根香烟,见证戒烟的每一步**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCalderic%2FChouGen)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)](https://supabase.com/)

[在线演示](https://chougen.vercel.app) · [问题反馈](https://github.com/Calderic/ChouGen/issues) · [功能建议](https://github.com/Calderic/ChouGen/discussions)

</div>

---

## 📖 项目简介

**抽根** 是一款现代化的香烟记录应用,帮助你清晰了解自己的吸烟习惯。通过可视化统计和社区激励,让戒烟之路不再孤单。

### ✨ 核心特性

- 🎯 **长按记录** - 独特的长按交互,记录每一次抽烟瞬间
- 📦 **口粮管理** - 智能库存管理,自动计算单支价格
- 📊 **数据统计** - 精美图表展示抽烟趋势、品牌偏好
- 🏆 **社区排行** - 查看排行榜,与社区一起戒烟打卡
- 🎨 **流畅动画** - 基于 Framer Motion 的丝滑交互体验
- 📱 **响应式设计** - 完美适配手机、平板、桌面端

### 🎬 界面预览

> 待补充截图...

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **npm** 或 **pnpm** 或 **yarn**
- **Supabase** 账号 (免费)

### 1️⃣ 克隆项目

```bash
git clone https://github.com/Calderic/ChouGen.git
cd ChouGen
```

### 2️⃣ 安装依赖

```bash
npm install
```

### 3️⃣ 配置环境变量

复制环境变量模板:

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件,填入你的配置:

```env
# Supabase 配置 (必需)
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥

# Linux.do OAuth (可选)
NEXT_PUBLIC_LINUXDO_CLIENT_ID=你的Client_ID
LINUXDO_CLIENT_SECRET=你的Client_Secret
NEXT_PUBLIC_LINUXDO_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**获取 Supabase 密钥:**

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目 (或使用现有项目)
3. 进入 `Settings` → `API` 复制密钥

**详细配置步骤**: 📚 [完整配置教程](./docs/quick-setup.md)

### 4️⃣ 初始化数据库

#### 方法一: Supabase SQL Editor (推荐)

1. 打开 [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. 复制 `supabase/migrations/20250110000000_initial_schema.sql` 内容
3. 粘贴并执行

#### 方法二: Supabase CLI

```bash
# 安装 CLI
npm install -g supabase

# 登录并关联项目
supabase login
supabase link --project-ref 你的项目ID

# 执行迁移
supabase db push
```

### 5️⃣ 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用!

---

## 🛠️ 技术栈

### 核心框架

| 技术                                          | 版本 | 用途           |
| --------------------------------------------- | ---- | -------------- |
| [Next.js](https://nextjs.org/)                | 15.5 | React 全栈框架 |
| [React](https://react.dev/)                   | 19.1 | UI 库          |
| [TypeScript](https://www.typescriptlang.org/) | 5.x  | 类型安全       |

### UI & 样式

| 技术                                            | 版本  | 用途       |
| ----------------------------------------------- | ----- | ---------- |
| [Material UI](https://mui.com/)                 | 7.3   | 组件库     |
| [Tailwind CSS](https://tailwindcss.com/)        | 4.x   | 工具类样式 |
| [Framer Motion](https://www.framer.com/motion/) | 12.23 | 动画引擎   |
| [Emotion](https://emotion.sh/)                  | 11.14 | CSS-in-JS  |

### 状态 & 数据

| 技术                                         | 版本 | 用途                   |
| -------------------------------------------- | ---- | ---------------------- |
| [Supabase](https://supabase.com/)            | 2.75 | 后端服务 (数据库+认证) |
| [TanStack Query](https://tanstack.com/query) | 5.90 | 服务端状态管理         |
| [Zustand](https://zustand-demo.pmnd.rs/)     | 5.0  | 客户端状态管理         |
| [Zod](https://zod.dev/)                      | 4.1  | 数据验证               |

### 数据可视化

| 技术                              | 版本 | 用途     |
| --------------------------------- | ---- | -------- |
| [Recharts](https://recharts.org/) | 3.2  | 图表库   |
| [date-fns](https://date-fns.org/) | 4.1  | 日期处理 |

### 开发工具

| 技术                                                 | 版本 | 用途         |
| ---------------------------------------------------- | ---- | ------------ |
| [ESLint](https://eslint.org/)                        | 9.x  | 代码检查     |
| [Prettier](https://prettier.io/)                     | 3.6  | 代码格式化   |
| [Husky](https://typicode.github.io/husky/)           | 9.1  | Git Hooks    |
| [lint-staged](https://github.com/okonet/lint-staged) | 16.2 | 暂存文件检查 |

---

## 📂 项目结构

```
ChouGen/
├── docs/                    # 📚 设计文档
│   ├── quick-setup.md       # 快速配置指南
│   ├── product-design.md    # 产品设计文档
│   └── ...                  # 其他技术文档
├── public/                  # 🖼️ 静态资源
│   ├── images/              # 图片资源
│   └── ...
├── src/
│   ├── app/                 # 📄 Next.js App Router 页面
│   │   ├── (auth)/          # 认证相关页面
│   │   ├── (main)/          # 主应用页面
│   │   └── api/             # API 路由
│   ├── components/          # 🧩 React 组件
│   │   ├── ui/              # 通用 UI 组件
│   │   ├── features/        # 业务功能组件
│   │   ├── layout/          # 布局组件
│   │   └── animations/      # 动画组件
│   ├── lib/                 # 🔧 工具库
│   │   ├── supabase/        # Supabase 客户端配置
│   │   ├── hooks/           # 自定义 React Hooks
│   │   ├── utils/           # 工具函数
│   │   ├── services/        # API 服务层
│   │   └── validations/     # Zod 验证模式
│   ├── stores/              # 🗄️ Zustand 状态管理
│   ├── types/               # 📝 TypeScript 类型定义
│   └── theme/               # 🎨 MUI 主题配置
├── supabase/
│   └── migrations/          # 💾 数据库迁移文件
├── .husky/                  # 🪝 Git Hooks 配置
├── eslint.config.mjs        # ESLint 配置
├── prettier.config.js       # Prettier 配置
├── tailwind.config.ts       # Tailwind 配置
└── tsconfig.json            # TypeScript 配置
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献!无论是 Bug 修复、新功能还是文档改进。

### 贡献流程

1. **Fork 项目**

   点击右上角 `Fork` 按钮,将项目 Fork 到你的账号下。

2. **克隆到本地**

   ```bash
   git clone https://github.com/Calderic/ChouGen.git
   cd ChouGen
   ```

3. **创建功能分支**

   ```bash
   git checkout -b feature/你的功能名称
   # 或修复 Bug
   git checkout -b fix/bug描述
   ```

4. **安装依赖并开发**

   ```bash
   npm install
   npm run dev
   ```

5. **提交代码**

   我们使用 Husky + lint-staged 自动化检查:

   ```bash
   git add .
   git commit -m "feat: 添加某某功能"
   ```

   提交信息格式建议:
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建/工具链相关

6. **推送到远程**

   ```bash
   git push origin feature/你的功能名称
   ```

7. **创建 Pull Request**
   - 回到 GitHub 上你 Fork 的项目页面
   - 点击 `Pull requests` → `New pull request`
   - 选择 `base: main` ← `compare: 你的分支`
   - 填写 PR 描述:
     - 📝 修改内容说明
     - 🎯 解决的问题 (关联 Issue)
     - 📸 截图 (如有 UI 变动)
     - ✅ 测试情况
   - 提交 PR 等待 Review

### 代码规范

项目已配置自动化检查,提交时会自动执行:

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查 (pre-push)

手动运行检查:

```bash
# 运行 Lint 并自动修复
npm run lint:fix

# 格式化代码
npm run format

# TypeScript 类型检查
npm run type-check

# 构建测试
npm run build
```

### 开发建议

- ✅ 遵循现有代码风格
- ✅ 添加必要的注释
- ✅ 确保 TypeScript 类型完整
- ✅ 测试你的更改
- ✅ 更新相关文档
- ❌ 不要提交 `.env.local` 或敏感信息
- ❌ 不要提交 `node_modules/` 或构建产物

---

## 📜 脚本命令

```bash
# 开发
npm run dev              # 启动开发服务器 (localhost:3000)

# 构建
npm run build            # 生产环境构建
npm run start            # 启动生产服务器

# 代码质量
npm run lint             # 运行 ESLint (带缓存)
npm run lint:fix         # 自动修复 ESLint 问题
npm run format           # 格式化所有代码
npm run format:check     # 检查代码格式
npm run type-check       # TypeScript 类型检查

# Git Hooks
npm run prepare          # 安装 Husky
```

---

## 🎯 开发路线图

查看 [product-design.md](./docs/product-design.md) 了解完整的产品规划。

### ✅ Phase 1: 基础架构 (已完成)

- [x] Next.js 15 + TypeScript 项目搭建
- [x] MUI v7 主题配置
- [x] Supabase 集成
- [x] Git Hooks 自动化

### ✅ Phase 2: 认证系统 (已完成)

- [x] 邮箱注册/登录
- [x] Linux.do OAuth 登录
- [x] 用户资料管理
- [x] Session 管理

### ✅ Phase 3: 核心功能 (已完成)

- [x] 长按记录抽烟交互
- [x] 口粮仓库管理
- [x] 记录历史查看
- [x] 数据统计图表
- [x] 社区排行榜

### 📅 Phase 4: 高级功能 (规划中)

- [ ] 戒烟目标设定
- [ ] 成就系统
- [ ] 社区互动 (点赞、评论)
- [ ] 数据导出 (CSV/JSON)
- [ ] PWA 支持 (离线可用)
- [ ] 暗黑模式
- [ ] 多语言支持

---

## 🙏 致谢

感谢以下开源项目和服务:

- [Next.js](https://nextjs.org/) - 提供强大的 React 框架
- [Supabase](https://supabase.com/) - 开源的 Firebase 替代方案
- [Material UI](https://mui.com/) - 精美的 React 组件库
- [Vercel](https://vercel.com/) - 优秀的部署平台
- [Linux.do](https://linux.do/) - 提供 OAuth 登录支持

---

## ⚠️ 健康声明

**本应用仅用于记录和统计目的,旨在帮助用户了解自己的吸烟习惯。**

**吸烟有害健康,请尽早戒烟!**

如需戒烟帮助,请咨询专业医疗机构。

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 📞 联系我们

- **GitHub Issues**: [问题反馈](https://github.com/Calderic/ChouGen/issues)
- **GitHub Discussions**: [功能讨论](https://github.com/Calderic/ChouGen/discussions)
- **Email**: (待补充)

---

<div align="center">

**如果这个项目对你有帮助,请给个 ⭐️ Star 支持一下!**

Made with ❤️ by [Calderic](https://github.com/Calderic)

</div>
