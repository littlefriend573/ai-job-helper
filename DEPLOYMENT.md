# AI Job Helper 部署方案

## 项目概览

AI Job Helper 是一款智能求职助手，帮助用户分析JD、生成岗位画像、匹配简历并提供优化建议。

## 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Boss直聘网页 → 抓取JD → 发送到 /api/import-jd        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (前端)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui    │   │
│  │  Pages: / (首页) /settings (设置) /about (关于)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase (数据库)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tables: users, ai_settings, job_collections,           │   │
│  │          resume_files, analysis_results                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI Providers                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DeepSeek / 智谱GLM / 通义千问 / SiliconFlow            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 部署步骤

### 1. Supabase 配置

#### 1.1 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 创建新项目，设置项目名称和密码
3. 等待项目初始化完成

#### 1.2 获取连接信息
在项目设置中获取：
- `NEXT_PUBLIC_SUPABASE_URL` - API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - 服务角色密钥

#### 1.3 创建数据库表
在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建 users 表（由 Supabase Auth 自动管理）

-- 创建 ai_settings 表
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_settings_user_id ON ai_settings(user_id);

-- 创建 job_collections 表
CREATE TABLE job_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  position VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  location VARCHAR(100),
  salary VARCHAR(50),
  experience VARCHAR(50),
  education VARCHAR(50),
  description TEXT,
  requirements TEXT,
  source_url TEXT,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_job_collections_user_id ON job_collections(user_id);
CREATE INDEX idx_job_collections_position ON job_collections(position);

-- 创建 resume_files 表
CREATE TABLE resume_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_files_user_id ON resume_files(user_id);

-- 创建 analysis_results 表
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  job_collection_id UUID REFERENCES job_collections(id),
  resume_file_id UUID REFERENCES resume_files(id),
  type VARCHAR(50) NOT NULL, -- 'jd_analysis' | 'resume_analysis' | 'match'
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_job_id ON analysis_results(job_collection_id);
CREATE INDEX idx_analysis_results_resume_id ON analysis_results(resume_file_id);
```

#### 1.4 配置 Auth
1. 进入 Auth -> Providers
2. 启用 GitHub OAuth（推荐）
3. 配置回调 URL：`https://your-vercel-domain.vercel.app/api/auth/callback/github`

### 2. Vercel 部署

#### 2.1 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | 公开变量 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 公开变量 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | 私密变量 |

#### 2.2 部署命令
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 部署到 Vercel（需要安装 Vercel CLI）
vercel --prod
```

#### 2.3 Vercel 配置文件
确保项目根目录有 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### 3. Chrome 插件打包

#### 3.1 准备图标
在 `extension/icons/` 目录中添加以下尺寸的图标：
- 16x16
- 32x32
- 48x48
- 128x128

#### 3.2 打包步骤
1. 打开 Chrome 浏览器
2. 进入 `chrome://extensions/`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `extension/` 目录

#### 3.3 发布到 Chrome Web Store
1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 创建新项目
3. 上传打包的扩展程序 ZIP 文件
4. 填写应用信息并发布

## API 接口文档

### POST /api/analyze-jd
分析 JD 并生成岗位画像

**请求体：**
```json
{
  "position": "前端工程师",
  "jds": ["JD文本1", "JD文本2"]
}
```

**响应：**
```json
{
  "keywords": ["React", "TypeScript", "Next.js"],
  "skills": ["React", "TypeScript", "CSS", "Node.js"],
  "requirements": ["3年以上经验", "本科及以上"],
  "capabilityProfile": {
    "skillFrequency": {"React": 85, "TypeScript": 78},
    "experienceLevel": "3-5年",
    "education": "本科",
    "tools": ["Git", "Webpack", "Vite"]
  }
}
```

### POST /api/analyze-resume
分析简历并匹配岗位画像

**请求体：**
```json
{
  "resumeText": "简历文本内容",
  "capabilityProfile": {}
}
```

**响应：**
```json
{
  "score": 75,
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["Next.js", "Node.js"],
  "suggestions": ["建议增加Next.js项目经验"]
}
```

### POST /api/import-jd
从插件导入 JD

**请求体：**
```json
{
  "jds": [
    {
      "title": "前端工程师",
      "company": "XX公司",
      "description": "...",
      "requirements": "...",
      "url": "https://..."
    }
  ],
  "source": "extension"
}
```

**响应：**
```json
{
  "success": true,
  "count": 5,
  "message": "成功保存5个JD"
}
```

### POST /api/test-connection
测试 AI 连接

**请求体：**
```json
{
  "provider": "deepseek",
  "apiKey": "your-api-key",
  "model": "deepseek-chat"
}
```

**响应：**
```json
{
  "success": true,
  "message": "连接成功"
}
```

## 上线检查清单

### 前端检查
- [ ] 所有页面正常加载
- [ ] JD 分析功能正常
- [ ] 简历上传功能正常
- [ ] AI 设置页面正常
- [ ] 响应式布局适配
- [ ] 错误处理完善

### API 检查
- [ ] `/api/analyze-jd` 正常工作
- [ ] `/api/analyze-resume` 正常工作
- [ ] `/api/import-jd` 正常工作
- [ ] `/api/test-connection` 正常工作
- [ ] 错误状态码正确返回
- [ ] CORS 配置正确

### 数据库检查
- [ ] 所有表已创建
- [ ] 索引已创建
- [ ] 权限配置正确
- [ ] 数据插入正常

### 插件检查
- [ ] JD 抓取功能正常
- [ ] 数据同步功能正常
- [ ] 设置功能正常
- [ ] 错误提示完善

### 安全检查
- [ ] API Key 加密存储
- [ ] HTTPS 配置正确
- [ ] SQL 注入防护
- [ ] 用户数据隔离

## 环境配置示例

### `.env.local`（开发环境）
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Vercel 环境变量
相同变量配置到 Vercel 项目设置中。

## 故障排除

### 常见问题

1. **API Key 无效**
   - 检查 API Key 是否正确
   - 确认服务商账户有足够额度
   - 检查网络连接

2. **数据库连接失败**
   - 检查环境变量配置
   - 确认 Supabase 项目状态正常
   - 检查网络策略

3. **插件无法同步**
   - 检查服务地址配置
   - 确认 CORS 配置
   - 检查 API 响应状态

4. **PDF 解析失败**
   - 确认文件格式正确
   - 检查文件大小限制
   - 确认 pdf-parse 依赖安装

## 维护建议

1. **定期备份数据库**
2. **监控 API 使用情况**
3. **定期更新依赖**
4. **记录用户反馈**
5. **持续优化 AI 分析逻辑**