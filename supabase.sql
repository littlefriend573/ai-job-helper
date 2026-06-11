-- AI Job Helper 数据库表结构
-- 请在 Supabase SQL Editor 中执行此脚本

-- 创建 ai_settings 表（存储用户AI配置）
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为 ai_settings 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);

-- 创建 job_collections 表（存储收集的JD）
CREATE TABLE IF NOT EXISTS job_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 为 job_collections 创建索引
CREATE INDEX IF NOT EXISTS idx_job_collections_user_id ON job_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_job_collections_position ON job_collections(position);
CREATE INDEX IF NOT EXISTS idx_job_collections_created_at ON job_collections(created_at DESC);

-- 创建 resume_files 表（存储上传的简历）
CREATE TABLE IF NOT EXISTS resume_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为 resume_files 创建索引
CREATE INDEX IF NOT EXISTS idx_resume_files_user_id ON resume_files(user_id);

-- 创建 analysis_results 表（存储分析结果）
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_collection_id UUID REFERENCES job_collections(id) ON DELETE SET NULL,
  resume_file_id UUID REFERENCES resume_files(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为 analysis_results 创建索引
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_job_id ON analysis_results(job_collection_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_resume_id ON analysis_results(resume_file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(type);

-- 启用 Row Level Security (RLS) - 启用后用户只能访问自己的数据

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略

-- ai_settings 策略
CREATE POLICY "Users can view own ai_settings" ON ai_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_settings" ON ai_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_settings" ON ai_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_settings" ON ai_settings
  FOR DELETE USING (auth.uid() = user_id);

-- job_collections 策略
CREATE POLICY "Users can view own job_collections" ON job_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job_collections" ON job_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job_collections" ON job_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job_collections" ON job_collections
  FOR DELETE USING (auth.uid() = user_id);

-- resume_files 策略
CREATE POLICY "Users can view own resume_files" ON resume_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume_files" ON resume_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume_files" ON resume_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume_files" ON resume_files
  FOR DELETE USING (auth.uid() = user_id);

-- analysis_results 策略
CREATE POLICY "Users can view own analysis_results" ON analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis_results" ON analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis_results" ON analysis_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis_results" ON analysis_results
  FOR DELETE USING (auth.uid() = user_id);

-- 匿名用户也可以插入 job_collections（用于插件导入）
CREATE POLICY "Anyone can insert job_collections" ON job_collections
  FOR INSERT WITH CHECK (true);

-- 允许匿名用户查看 job_collections
CREATE POLICY "Anyone can view job_collections" ON job_collections
  FOR SELECT USING (true);
