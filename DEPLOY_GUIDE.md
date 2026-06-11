# AI Job Helper 部署指南

## 📋 完整部署步骤

### 第一步：在Supabase中创建数据库表

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`itirtkqnxnxvhtwrpnsf`
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制 `supabase.sql` 文件中的所有内容
6. 粘贴到查询编辑器中
7. 点击 **Run** 执行

### 第二步：配置Vercel环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** → **Project**
3. 选择 **Import Git Repository**
4. 选择你的GitHub仓库（如果没有，先上传到GitHub）
5. 在 **Environment Variables** 中添加以下变量：

```
名称: NEXT_PUBLIC_SUPABASE_URL
值: https://itirtkqnxnxvhtwrpnsf.supabase.co

名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTcwMTAsImV4cCI6MjA5NjYzMzAxMH0.gxZuHm5oALHexQx8U4tYXejxyAttNcc2bCpoLs3sTb8

名称: SUPABASE_SERVICE_ROLE_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXJ0a3FueG54dmh0d3JwbnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTCGmv3tVN26nxDKTiVgPrxHMFztSfNtXoWwfQ.J3gKPOqpRUUyitkh22xms-_IU93_siw3VBb3Q8DUetQ
```

6. 点击 **Deploy**

### 第三步：等待部署完成

Vercel会自动构建和部署你的项目。通常需要2-3分钟。

部署完成后，你会获得一个URL，例如：`https://ai-job-helper.vercel.app`

### 第四步：配置插件服务地址

1. 安装Chrome插件（加载已解压的扩展程序，选择 `extension/` 目录）
2. 点击插件图标
3. 点击 **服务设置**
4. 将服务地址改为你的Vercel URL，例如：`https://ai-job-helper.vercel.app`
5. 点击保存

---

## 🔧 本地开发

如果你想在本地运行项目：

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开 http://localhost:3000
```

---

## 📝 常见问题

### Q1: 部署失败怎么办？

**解决方案：**
1. 检查GitHub仓库是否包含所有必要文件
2. 查看Vercel构建日志中的错误信息
3. 确保环境变量配置正确
4. 检查package.json中的依赖是否正确

### Q2: 数据库表创建失败？

**解决方案：**
1. 确保在Supabase SQL Editor中执行
2. 检查是否有权限执行SQL
3. 尝试逐个CREATE TABLE语句执行
4. 确保表名没有冲突

### Q3: 插件无法同步数据？

**解决方案：**
1. 确认Vercel部署成功且可以访问
2. 检查插件中的服务地址是否正确
3. 确认Supabase数据库表已创建
4. 检查浏览器控制台错误信息

### Q4: AI分析功能不工作？

**解决方案：**
1. 检查AI设置页面中的API Key是否正确
2. 确认API Key有足够的调用额度
3. 测试连接功能是否成功

---

## 🚀 技术栈

- **前端框架**: Next.js 15
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase
- **AI**: DeepSeek / 智谱GLM / 通义千问 / SiliconFlow
- **部署**: Vercel
- **浏览器插件**: Chrome Extension

## 📞 获取帮助

如果遇到问题，可以：
1. 查看Vercel构建日志
2. 检查Supabase日志
3. 打开浏览器开发者工具查看错误信息

---

## ✨ 后续优化建议

1. **配置GitHub OAuth登录**
   - 在Supabase中启用GitHub Provider
   - 配置回调URL

2. **优化AI分析**
   - 调整AI提示词
   - 增加缓存机制

3. **扩展功能**
   - 添加简历模板
   - 增加职位搜索功能
   - 支持更多招聘平台

4. **性能优化**
   - 启用Vercel缓存
   - 优化图片加载
   - 减少API调用次数

5. **监控和日志**
   - 配置Vercel Analytics
   - 设置错误告警
   - 记录用户行为

---

## 📄 项目结构

```
ai-job-helper/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── analyze-jd/    # JD分析接口
│   │   ├── analyze-resume/ # 简历分析接口
│   │   ├── import-jd/    # JD导入接口
│   │   └── test-connection/ # 连接测试
│   ├── settings/         # 设置页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React组件
├── lib/                   # 工具库
│   ├── ai.ts            # AI调用逻辑
│   ├── supabase.ts      # Supabase客户端
│   └── utils.ts         # 工具函数
├── extension/            # Chrome插件
├── supabase.sql         # 数据库表结构
├── package.json         # 项目配置
├── next.config.ts       # Next.js配置
├── tailwind.config.ts   # Tailwind配置
├── vercel.json         # Vercel配置
└── DEPLOYMENT.md       # 部署文档
```

---

**祝你部署成功！🎉**