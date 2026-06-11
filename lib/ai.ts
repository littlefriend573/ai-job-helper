export interface AnalysisResult {
  keywords: string[];
  skillProfile: SkillProfile;
  matchScore: number;
  suggestions: string[];
}

export interface SkillProfile {
  technicalSkills: string[];
  softSkills: string[];
  experienceLevel: string;
  educationRequirements: string[];
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

const providers: Record<string, { apiUrl: string; format: 'openai' | 'qwen' | 'claude' }> = {
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    format: 'openai',
  },
  glm: {
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    format: 'openai',
  },
  qwen: {
    apiUrl: 'https://dashscope.aliyuncs.com/api/text/text-generation',
    format: 'qwen',
  },
  siliconflow: {
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    format: 'openai',
  },
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    format: 'openai',
  },
  claude: {
    apiUrl: 'https://api.anthropic.com/v1/messages',
    format: 'claude',
  },
};

async function callAI(prompt: string, config: AIConfig): Promise<string> {
  const providerConfig = providers[config.provider];
  if (!providerConfig) {
    throw new Error('未知的API提供商');
  }

  const { apiUrl, format } = providerConfig;

  try {
    let body: Record<string, unknown>;

    switch (format) {
      case 'openai':
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        };
        break;

      case 'qwen':
        body = {
          model: config.model,
          input: {
            messages: [{ role: 'user', content: prompt }],
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 2048,
          },
        };
        break;

      case 'claude':
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
        };
        break;

      default:
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API调用失败');
    }

    switch (format) {
      case 'openai':
        return data.choices?.[0]?.message?.content || '';
      case 'qwen':
        return data.output?.text || '';
      case 'claude':
        return data.content?.[0]?.text || '';
      default:
        return data.choices?.[0]?.message?.content || '';
    }
  } catch (error) {
    console.error('AI调用失败:', error);
    throw error;
  }
}

export async function analyzeJD(
  jdText: string,
  config: AIConfig
): Promise<{ keywords: string[]; skillProfile: SkillProfile }> {
  const prompt = `
分析以下职位描述(JD)，提取关键信息：

JD内容：
${jdText}

请以JSON格式输出，包含以下字段：
1. keywords: 从JD中提取的核心关键词数组
2. skillProfile: 包含以下子字段：
   - technicalSkills: 技术技能要求数组
   - softSkills: 软技能要求数组
   - experienceLevel: 经验要求描述
   - educationRequirements: 学历要求数组

请确保输出是有效的JSON格式，不要包含其他文字。
`;

  const result = await callAI(prompt, config);

  try {
    return JSON.parse(result);
  } catch {
    return {
      keywords: [],
      skillProfile: {
        technicalSkills: [],
        softSkills: [],
        experienceLevel: '',
        educationRequirements: [],
      },
    };
  }
}

export async function analyzeResume(
  resumeText: string,
  config: AIConfig
): Promise<{ keywords: string[]; experience: string; skills: string[] }> {
  const prompt = `
分析以下简历内容，提取关键信息：

简历内容：
${resumeText}

请以JSON格式输出，包含以下字段：
1. keywords: 从简历中提取的核心关键词数组
2. experience: 工作经验描述
3. skills: 技能列表数组

请确保输出是有效的JSON格式，不要包含其他文字。
`;

  const result = await callAI(prompt, config);

  try {
    return JSON.parse(result);
  } catch {
    return {
      keywords: [],
      experience: '',
      skills: [],
    };
  }
}

export async function calculateMatch(
  jobRequirements: SkillProfile,
  resumeSkills: string[],
  config: AIConfig
): Promise<{ score: number; suggestions: string[] }> {
  const prompt = `
分析求职者技能与岗位要求的匹配度：

岗位技能要求：
技术技能: ${jobRequirements.technicalSkills.join(', ')}
软技能: ${jobRequirements.softSkills.join(', ')}
经验要求: ${jobRequirements.experienceLevel}
学历要求: ${jobRequirements.educationRequirements.join(', ')}

求职者技能：
${resumeSkills.join(', ')}

请以JSON格式输出，包含以下字段：
1. score: 匹配度分数（0-100）
2. suggestions: 简历优化建议数组（至少5条具体建议）

请确保输出是有效的JSON格式，不要包含其他文字。
`;

  const result = await callAI(prompt, config);

  try {
    return JSON.parse(result);
  } catch {
    return {
      score: 0,
      suggestions: [],
    };
  }
}
