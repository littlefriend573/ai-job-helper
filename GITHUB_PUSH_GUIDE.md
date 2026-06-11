# 📤 GitHub 快速推送指南

## 🎯 目标
将你的 AI Job Helper 项目推送到 GitHub，以便部署到 Vercel

## 📝 详细步骤

### 第一步：创建 GitHub 仓库

1. **打开 GitHub**
   - 访问 https://github.com
   - 登录你的账号

2. **创建新仓库**
   - 点击右上角的 **+** 按钮
   - 选择 **New repository**

3. **填写仓库信息**
   ```
   Repository name: ai-job-helper
   Description: AI Job Helper - 智能求职助手
   选择: Public (公开) 或 Private (私有)
   ✅ 勾选: Add a README file
   ✅ 勾选: Add .gitignore → 选择: Node
   ```

4. **创建仓库**
   - 点击 **Create repository**
   - 复制仓库 URL，类似于：
     ```
     https://github.com/YOUR_USERNAME/ai-job-helper.git
     ```

### 第二步：准备本地项目

1. **打开终端**
   - 按 `Win + R`
   - 输入 `cmd` 并回车
   - 进入项目目录：
     ```bash
     cd d:\my-project\ai-job-helper
     ```

2. **初始化 Git（如果还没有）**
   ```bash
   git init
   ```

3. **配置 Git 用户信息**（如果还没有配置）
   ```bash
   git config --global user.name "你的用户名"
   git config --global user.email "你的邮箱"
   ```

### 第三步：提交代码

1. **添加所有文件到 Git**
   ```bash
   git add .
   ```

   注意：`.gitignore` 会自动忽略以下文件：
   - `node_modules/`
   - `.next/`
   - `.env.local`
   - 其他不需要的文件

2. **提交代码**
   ```bash
   git commit -m "feat: AI Job Helper MVP - 智能求职助手"
   ```

3. **连接远程仓库**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-job-helper.git
   ```

   如果出现 "remote origin already exists" 错误，运行：
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/ai-job-helper.git
   ```

### 第四步：推送到 GitHub

1. **推送代码**
   ```bash
   git branch -M main
   git push -u origin main
   ```

2. **输入凭证**
   - 可能需要输入 GitHub 用户名和密码
   - 或使用 Personal Access Token

3. **验证推送成功**
   - 刷新 GitHub 仓库页面
   - 应该能看到所有文件

### 第五步：部署到 Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com/dashboard
   - 点击 **Add New** → **Project**

2. **导入 GitHub 仓库**
   - 在列表中找到 `ai-job-helper`
   - 点击 **Import**

3. **配置环境变量**
   - 点击 **Environment Variables**
   - 添加以下三个变量：

   ```
   NEXT_PUBLIC_SUPABASE_URL
   值: https://itirtkqnxnxvhtwrpnsf.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTcwMTAsImV4cCI6MjA5NjYzMzAxMH0.gxZuHm5oALHexQx8U4tYXejxyAttNcc2bCpoLs3sTb8

   SUPABASE_SERVICE_ROLE_KEY
   值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTCGmv3tVN26nxDKTiVgPrxHMFztSfNtXoWwfQ.J3gKPOqpRUUyitkh22xms-_IU93_siw3VBb3Q8DUetQ
   ```

4. **部署**
   - 点击 **Deploy**
   - 等待 2-3 分钟
   - 获得部署 URL！

### 🎉 完成！

恭喜！你的 AI Job Helper 已经成功部署！

**访问地址：** `https://your-project.vercel.app`

---

## 🔧 常见问题

### Q1: GitHub 推送被拒绝？

**解决方法：**
```bash
# 先拉取远程代码
git pull origin main --allow-unrelated-histories

# 然后再推送
git push -u origin main
```

### Q2: 忘记了 GitHub 密码？

**解决方法：**
1. 访问 https://github.com/password_reset
2. 重置密码
3. 或使用 Personal Access Token

### Q3: Vercel 部署失败？

**解决方法：**
1. 检查环境变量是否配置正确
2. 查看构建日志中的错误
3. 确保 GitHub 仓库是公开的

### Q4: 如何更新代码？

```bash
# 1. 修改代码

# 2. 添加修改
git add .

# 3. 提交
git commit -m "fix: 修复了XXX问题"

# 4. 推送
git push

# Vercel 会自动重新部署！
```

### Q5: 如何查看部署状态？

1. 访问 Vercel Dashboard
2. 点击项目
3. 查看 Deployments 列表

---

## 📚 相关文档

- [DEPLOY_STEP_BY_STEP.md](DEPLOY_STEP_BY_STEP.md) - 详细部署步骤
- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署文档
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - 部署检查清单
- [README.md](README.md) - 项目说明

---

**🚀 现在开始推送你的代码到 GitHub 吧！**