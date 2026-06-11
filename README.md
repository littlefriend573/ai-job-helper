# AI Job Helper - 智能求职助手 🚀

[English](README_en.md) | 简体中文

## 📖 项目简介

AI Job Helper 是一款智能求职助手，帮助用户：
- 🤖 AI 分析 Boss 直聘等招聘网站的 JD
- 📊 生成岗位能力画像
- 📄 上传简历并匹配分析
- 💡 提供简历优化建议
- 🔌 Chrome 浏览器插件一键收集 JD

## ✨ 核心功能

### 1. JD 分析与画像生成
- 粘贴多个 JD 文本
- AI 自动提取关键技能
- 生成岗位能力画像
- 统计高频技能要求

### 2. 简历匹配与优化
- 上传 PDF 简历
- AI 解析简历内容
- 计算匹配度
- 提供优化建议

### 3. Chrome 浏览器插件
- 一键抓取 JD 信息
- 自动同步到系统
- 无需复制粘贴

### 4. AI 配置
- 支持 DeepSeek
- 支持智谱 GLM
- 支持通义千问
- 支持 SiliconFlow
- 配置云端同步

## 🛠️ 技术栈

- **前端框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase
- **AI**: DeepSeek / 智谱GLM / 通义千问 / SiliconFlow
- **部署**: Vercel
- **浏览器插件**: Chrome Extension

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 📦 项目结构

```
ai-job-helper/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── analyze-jd/    # JD 分析接口
│   │   ├── analyze-resume/ # 简历分析接口
│   │   ├── import-jd/     # JD 导入接口
│   │   └── test-connection/ # 连接测试
│   ├── settings/         # 设置页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
├── lib/                   # 工具库
│   ├── ai.ts            # AI 调用逻辑
│   ├── supabase.ts      # Supabase 客户端
│   └── utils.ts         # 工具函数
├── extension/            # Chrome 插件
├── supabase.sql         # 数据库表结构
└── package.json         # 项目配置
```

## 🗄️ 数据库配置

### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 创建数据库表

在 Supabase SQL Editor 中执行 `supabase.sql` 文件中的所有 SQL 语句。

## 🚀 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 点击 Deploy

详细步骤请查看 [DEPLOY_STEP_BY_STEP.md](DEPLOY_STEP_BY_STEP.md)

## 🔧 使用指南

### 配置 AI

1. 打开设置页面
2. 选择 AI 服务商
3. 输入 API Key
4. 选择模型
5. 测试连接
6. 保存配置

### 分析 JD

1. 输入岗位名称
2. 粘贴 JD 文本（支持多个）
3. 点击分析
4. 查看岗位画像

### 匹配简历

1. 上传 PDF 简历
2. 系统自动解析
3. 查看匹配度
4. 获取优化建议

### 使用插件

1. 安装 Chrome 插件
2. 访问 Boss 直聘
3. 点击插件图标
4. 收集 JD
5. 同步到系统

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**祝你求职顺利！** 🎉"# ai-job-helper" 
