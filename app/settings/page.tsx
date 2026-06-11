'use client';
import { useState, useEffect } from 'react';
import { Settings, ChevronLeft, Eye, EyeOff, TestTube, Save, CheckCircle, XCircle, AlertCircle, User, LogOut, Cloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { providers, ProviderType, AIConfig } from '@/lib/providers';

export default function SettingsPage() {
  const [provider, setProvider] = useState<ProviderType>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveToCloud, setSaveToCloud] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = localStorage.getItem('ai-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setProvider(config.provider as ProviderType);
        setApiKey(config.apiKey || '');
        setModel(config.model || '');
      }

      if (user) {
        const { data: aiSettings, error } = await supabase
          .from('ai_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (aiSettings && !savedConfig) {
          setProvider(aiSettings.provider as ProviderType);
          setApiKey(aiSettings.api_key || '');
          setModel(aiSettings.model || '');
        }
      }

      if (!model) {
        setModel(providers[provider].models[0]);
      }
    };

    if (!loading) {
      loadConfig();
    }
  }, [loading, user]);

  useEffect(() => {
    if (providers[provider].models.length > 0) {
      if (!model || !providers[provider].models.includes(model)) {
        setModel(providers[provider].models[0]);
      }
    }
  }, [provider]);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestStatus('success');
        setTestMessage('连接成功');
      } else {
        setTestStatus('error');
        setTestMessage(data.message || 'API Key无效或模型不可用');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('连接失败，请检查网络');
    }
  };

  const handleSave = async () => {
    const config = { provider, apiKey, model };
    localStorage.setItem('ai-config', JSON.stringify(config));

    if (user && saveToCloud) {
      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          user_id: user.id,
          provider,
          api_key: apiKey,
          model,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('保存到云端失败:', error);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github'
    });
    if (error) console.error('登录失败:', error);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('登出失败:', error);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">AI设置</h1>
                  <p className="text-xs text-muted-foreground">配置AI服务商</p>
                </div>
              </div>
            </div>
            
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{user.email?.split('@')[0]}</span>
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* User Info */}
            {user && (
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">已登录: {user.email}</p>
                    <p className="text-xs text-muted-foreground">配置将同步到云端</p>
                  </div>
                </div>
              </div>
            )}

            {/* API Provider */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API 提供商
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ProviderType)}
                className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="zhipu">智谱AI</option>
                <option value="qwen">通义千问</option>
                <option value="siliconflow">SiliconFlow</option>
                <option value="openai">OpenAI（预留）</option>
                <option value="claude">Claude（预留）</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入API Key"
                  className="w-full px-4 py-3 pr-12 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                {providers[provider].models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Save to Cloud */}
            {user && (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">同步到云端</p>
                    <p className="text-xs text-muted-foreground">配置将保存到Supabase</p>
                  </div>
                </div>
                <button
                  onClick={() => setSaveToCloud(!saveToCloud)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    saveToCloud ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      saveToCloud ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Test Connection */}
            <div>
              <button
                onClick={handleTestConnection}
                disabled={!apiKey.trim() || testStatus === 'testing'}
                className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground py-3 px-6 rounded-xl font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testStatus === 'testing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5" />
                    测试连接
                  </>
                )}
              </button>

              {testStatus !== 'idle' && (
                <div
                  className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl ${
                    testStatus === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {testStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    保存成功
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    保存设置
                  </>
                )}
              </button>
            </div>

            {/* Guide Section */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">免费 API 获取指南</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <div>
                    <span className="font-medium text-foreground">DeepSeek：</span>
                    <span className="text-muted-foreground">新用户送大量免费额度</span>
                    <p className="text-muted-foreground">platform.deepseek.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <div>
                    <span className="font-medium text-foreground">智谱AI：</span>
                    <span className="text-muted-foreground">免费额度，国内速度快</span>
                    <p className="text-muted-foreground">open.bigmodel.cn</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <div>
                    <span className="font-medium text-foreground">通义千问：</span>
                    <span className="text-muted-foreground">免费额度，阿里云支持</span>
                    <p className="text-muted-foreground">dashscope.aliyun.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <div>
                    <span className="font-medium text-foreground">SiliconFlow：</span>
                    <span className="text-muted-foreground">聚合平台，多种模型</span>
                    <p className="text-muted-foreground">siliconflow.cn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>AI Job Helper - 智能求职助手</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
