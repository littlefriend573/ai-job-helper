export type ProviderType = 'deepseek' | 'zhipu' | 'qwen' | 'siliconflow' | 'openai' | 'claude';

export interface ProviderConfig {
  name: string;
  models: string[];
  apiUrl: string;
  format: 'openai' | 'qwen' | 'claude';
}

export interface AIConfig {
  provider: ProviderType;
  apiKey: string;
  model: string;
}

export const providers: Record<ProviderType, ProviderConfig> = {
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    format: 'openai',
  },
  zhipu: {
    name: '智谱AI',
    models: ['glm-4-air', 'glm-4-flash', 'glm-4-plus'],
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    format: 'openai',
  },
  qwen: {
    name: '通义千问',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    apiUrl: 'https://dashscope.aliyuncs.com/api/text/text-generation',
    format: 'qwen',
  },
  siliconflow: {
    name: 'SiliconFlow',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen3', 'THUDM/GLM'],
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    format: 'openai',
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    format: 'openai',
  },
  claude: {
    name: 'Claude',
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet'],
    apiUrl: 'https://api.anthropic.com/v1/messages',
    format: 'claude',
  },
};

export function getProviderConfig(providerName: string): ProviderConfig | undefined {
  const provider = providerName.toLowerCase() as ProviderType;
  return providers[provider];
}