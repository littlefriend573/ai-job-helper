# AI Job Helper - GitHub 和 Vercel 部署脚本

## 📋 快速部署步骤

### 方式一：使用 GitHub Desktop（推荐新手）

#### 1. 创建 GitHub 仓库

1. 打开 [GitHub](https://github.com) 并登录
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - Repository name: `ai-job-helper`
   - Description: `AI Job Helper - 智能求职助手`
   - 选择 **Public** 或 **Private**
   - ✅ 勾选 **Add a README file**
4. 点击 **Create repository**

#### 2. 上传项目文件

1. 在仓库页面，点击 **uploading an existing file**
2. 将 `ai-job-helper` 文件夹中的**所有文件**拖拽到上传区域
3. 注意：**不要**上传以下文件和文件夹：
   - `node_modules/`
   - `.next/`
   - `.env.local`
   - `.git/`
4. 点击 **Commit changes**

#### 3. 部署到 Vercel

1. 打开 [Vercel](https://vercel.com/dashboard)
2. 点击 **Add New** → **Project**
3. 在 "Import Git Repository" 中找到你的 `ai-job-helper` 仓库
4. 点击 **Import**
5. 在 **Environment Variables** 部分添加：

```
NEXT_PUBLIC_SUPABASE_URL = https://itirtkqnxnxvhtwrpnsf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTcwMTAsImV4cCI6MjA5NjYzMzAxMH0.gxZuHm5oALHexQx8U4tYXejxyAttNcc2bCpoLs3sTb8
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTCGmv3tVN26nxDKTiVgPrxHMFztSfNtXoWwfQ.J3gKPOqpRUUyitkh22xms-_IU93_siw3VBb3Q8DUetQ
```

6. 点击 **Deploy**
7. 等待 2-3 分钟，部署完成！

---

### 方式二：使用命令行

#### 1. 安装 Git 和 Vercel CLI

```bash
# 安装 Git（如果还没安装）
# 下载地址：https://git-scm.com/download/win

# 安装 Vercel CLI
npm install -g vercel
```

#### 2. 创建 GitHub 仓库

```bash
# 进入项目目录
cd d:\my-project\ai-job-helper

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: AI Job Helper MVP"

# 创建 GitHub 仓库（需要在 GitHub 网站上创建）

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-job-helper.git

# 推送
git push -u origin main
```

#### 3. 部署到 Vercel

```bash
# 登录 Vercel
vercel login

# 部署（按提示操作）
vercel

# 生产环境部署
vercel --prod
```

---

## 🗄️ 数据库配置（Supabase）

### 创建数据库表

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`itirtkqnxnxvhtwrpnsf`
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制 `supabase.sql` 文件中的所有 SQL 语句
6. 点击 **Run** 执行

### 验证表创建成功

1. 点击左侧菜单 **Table Editor**
2. 应该能看到以下表：
   - `ai_settings`
   - `job_collections`
   - `resume_files`
   - `analysis_results`

---

## 🔌 Chrome 插件配置

### 加载插件

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择项目中的 `extension/` 文件夹

### 配置服务地址

1. 点击插件图标
2. 点击 **服务设置**
3. 输入你的 Vercel URL，例如：`https://ai-job-helper.vercel.app`
4. 点击 **保存设置**

---

## ✅ 部署检查清单

部署完成后，检查以下项目：

- [ ] Vercel 部署成功，获得 URL
- [ ] 打开网站显示正常
- [ ] JD 分析功能正常
- [ ] 简历上传功能正常
- [ ] AI 设置页面正常
- [ ] Supabase 数据库表已创建
- [ ] Chrome 插件可以同步数据

---

## 🚨 常见问题

### 1. Vercel 部署失败

**解决方法：**
```bash
# 查看详细错误
vercel --debug

# 检查环境变量是否配置正确
# 确保在 Vercel Dashboard 的 Environment Variables 中添加了所有变量
```

### 2. 数据库表创建失败

**解决方法：**
- 确保在 Supabase SQL Editor 中执行
- 检查是否有权限
- 尝试逐条执行 SQL 语句

### 3. 插件无法同步数据

**解决方法：**
- 检查 Vercel URL 是否正确
- 确认数据库表已创建
- 查看浏览器控制台错误信息

### 4. AI 分析不工作

**解决方法：**
- 检查 AI 设置中的 API Key
- 测试连接功能
- 确认 API Key 有额度

---

## 📞 获取帮助

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查 Supabase 日志
3. 打开浏览器开发者工具（F12）
4. 查看本项目的 GitHub Issues

---

## 🎉 恭喜！

如果所有步骤都成功完成，你的 AI Job Helper 已经成功部署！

**访问地址：** `https://ai-job-helper.vercel.app`（替换为你的实际URL）

**现在你可以：**
- ✅ 在 Boss 直聘上收集 JD
- ✅ 使用 AI 分析岗位要求
- ✅ 上传简历进行匹配
- ✅ 获取优化建议

**祝你求职顺利！** 🚀