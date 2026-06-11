import { providers } from './providers';

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

/**
 * 从AI返回内容中提取JSON
 * 处理markdown代码块包裹的情况
 */
function extractJSON(content: string): unknown {
  console.log(`[extractJSON] 原始内容长度: ${content.length}`);
  console.log(`[extractJSON] 原始内容前200字符: ${content.substring(0, 200)}`);

  // 尝试直接解析
  try {
    const parsed = JSON.parse(content.trim());
    console.log(`[extractJSON] 直接解析成功`);
    return parsed;
  } catch {
    // 继续尝试其他方式
  }

  // 去除markdown代码块标记
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();

  console.log(`[extractJSON] 清理后内容前200字符: ${cleaned.substring(0, 200)}`);

  // 尝试找到JSON开始和结束位置
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const jsonStr = cleaned.substring(startIndex, endIndex + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      console.log(`[extractJSON] 从代码块中提取JSON成功`);
      return parsed;
    } catch {
      console.log(`[extractJSON] 从代码块中提取JSON失败`);
    }
  }

  // 尝试解析数组格式
  const arrStartIndex = cleaned.indexOf('[');
  const arrEndIndex = cleaned.lastIndexOf(']');
  if (arrStartIndex !== -1 && arrEndIndex !== -1 && arrEndIndex > arrStartIndex) {
    const jsonStr = cleaned.substring(arrStartIndex, arrEndIndex + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      console.log(`[extractJSON] 从数组格式中提取JSON成功`);
      return parsed;
    } catch {
      console.log(`[extractJSON] 从数组格式中提取JSON失败`);
    }
  }

  console.error(`[extractJSON] 所有解析方式均失败`);
  console.error(`[extractJSON] 原始内容: ${content}`);
  throw new Error('无法解析AI返回的JSON内容');
}

async function callAI(prompt: string, config: AIConfig): Promise<string> {
  const provider = config.provider.toLowerCase();
  const providerConfig = providers[provider as keyof typeof providers];

  if (!providerConfig) {
    console.error(`[callAI] 未知的API提供商: ${provider}`);
    throw new Error('未知的API提供商');
  }

  const { apiUrl, format } = providerConfig;

  console.log(`[callAI] 开始调用AI: provider=${provider}, model=${config.model}, apiUrl=${apiUrl}`);

  try {
    let body: Record<string, unknown>;

    switch (format) {
      case 'openai':
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 4096,
        };
        break;

      case 'qwen':
        body = {
          model: config.model,
          input: {
            messages: [{ role: 'user', content: prompt }],
          },
          parameters: {
            temperature: 0.3,
            max_tokens: 4096,
          },
        };
        break;

      case 'claude':
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4096,
        };
        break;

      default:
        body = {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 4096,
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
      console.error(`[callAI] API调用失败: status=${response.status}, error=${JSON.stringify(data)}`);
      throw new Error(data.error?.message || 'API调用失败');
    }

    let result = '';
    switch (format) {
      case 'openai':
        result = data.choices?.[0]?.message?.content || '';
        break;
      case 'qwen':
        result = data.output?.text || '';
        break;
      case 'claude':
        result = data.content?.[0]?.text || '';
        break;
      default:
        result = data.choices?.[0]?.message?.content || '';
    }

    console.log(`[callAI] 调用成功: resultLength=${result.length}`);
    return result;
  } catch (error) {
    console.error(`[callAI] 调用异常: ${(error as Error).message}`);
    throw error;
  }
}

export async function analyzeJD(
  jdText: string,
  config: AIConfig
): Promise<{ keywords: string[]; skillProfile: SkillProfile }> {
  console.log(`[analyzeJD] 开始分析JD: length=${jdText.length}`);

  const prompt = `你是专业招聘分析专家。请严格按照以下JSON格式返回。
只返回JSON。
不要输出任何解释。
不要输出markdown。
不要输出 \`\`\`json。
不要输出多余文字。
返回内容必须是合法JSON。

分析以下职位描述(JD)，提取关键信息：

JD内容：
${jdText}

返回格式：
{
  "keywords": ["关键词1", "关键词2"],
  "skillProfile": {
    "technicalSkills": ["技能1", "技能2"],
    "softSkills": ["软技能1", "软技能2"],
    "experienceLevel": "经验要求描述",
    "educationRequirements": ["学历要求1"]
  }
}`;

  const result = await callAI(prompt, config);

  console.log(`[analyzeJD] AI原始返回:`);
  console.log(result);

  try {
    const parsed = extractJSON(result) as { keywords: string[]; skillProfile: SkillProfile };
    console.log(`[analyzeJD] 解析结果:`);
    console.log(JSON.stringify(parsed, null, 2));
    console.log(`[analyzeJD] 分析完成: keywords=${parsed.keywords?.length || 0}, technicalSkills=${parsed.skillProfile?.technicalSkills?.length || 0}`);

    // 验证必要字段
    if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
      throw new Error('AI返回缺少keywords字段');
    }
    if (!parsed.skillProfile) {
      throw new Error('AI返回缺少skillProfile字段');
    }

    return parsed;
  } catch (e) {
    console.error(`[analyzeJD] JSON解析失败: ${(e as Error).message}`);
    console.error(`[analyzeJD] AI原始返回内容: ${result}`);
    throw new Error(`AI返回解析失败: ${(e as Error).message}`);
  }
}

export async function analyzeResume(
  resumeText: string,
  config: AIConfig
): Promise<{ keywords: string[]; experience: string; skills: string[] }> {
  console.log(`[analyzeResume] 开始分析简历: length=${resumeText.length}`);

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('简历文本为空');
  }

  const prompt = `你是专业简历分析专家。请严格按照以下JSON格式返回。
只返回JSON。
不要输出任何解释。
不要输出markdown。
不要输出 \`\`\`json。
不要输出多余文字。
返回内容必须是合法JSON。

分析以下简历内容，提取关键信息：

简历内容：
${resumeText}

返回格式：
{
  "keywords": ["关键词1", "关键词2"],
  "experience": "工作经验描述",
  "skills": ["技能1", "技能2"]
}`;

  const result = await callAI(prompt, config);

  console.log(`[analyzeResume] AI原始返回:`);
  console.log(result);

  try {
    const parsed = extractJSON(result) as { keywords: string[]; experience: string; skills: string[] };
    console.log(`[analyzeResume] 解析结果:`);
    console.log(JSON.stringify(parsed, null, 2));
    console.log(`[analyzeResume] 分析完成: keywords=${parsed.keywords?.length || 0}, skills=${parsed.skills?.length || 0}`);

    // 验证必要字段
    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      throw new Error('AI返回缺少skills字段');
    }

    return parsed;
  } catch (e) {
    console.error(`[analyzeResume] JSON解析失败: ${(e as Error).message}`);
    console.error(`[analyzeResume] AI原始返回内容: ${result}`);
    throw new Error(`AI返回解析失败: ${(e as Error).message}`);
  }
}

export async function calculateMatch(
  jobRequirements: SkillProfile,
  resumeSkills: string[],
  config: AIConfig
): Promise<{ score: number; suggestions: string[] }> {
  console.log(`[calculateMatch] 开始计算匹配度: jobSkills=${jobRequirements.technicalSkills.length}, resumeSkills=${resumeSkills.length}`);

  if (!resumeSkills || resumeSkills.length === 0) {
    throw new Error('简历技能为空');
  }

  const prompt = `你是专业HR和招聘专家。请严格按照以下JSON格式返回。
只返回JSON。
不要输出任何解释。
不要输出markdown。
不要输出 \`\`\`json。
不要输出多余文字。
返回内容必须是合法JSON。

分析求职者技能与岗位要求的匹配度：

岗位技能要求：
技术技能: ${jobRequirements.technicalSkills.join(', ')}
软技能: ${jobRequirements.softSkills.join(', ')}
经验要求: ${jobRequirements.experienceLevel}
学历要求: ${jobRequirements.educationRequirements.join(', ')}

求职者技能：
${resumeSkills.join(', ')}

返回格式：
{
  "score": 75,
  "suggestions": ["建议1", "建议2", "建议3", "建议4", "建议5"]
}`;

  const result = await callAI(prompt, config);

  console.log(`[calculateMatch] AI原始返回:`);
  console.log(result);

  try {
    const parsed = extractJSON(result) as { score: number; suggestions: string[] };
    console.log(`[calculateMatch] 解析结果:`);
    console.log(JSON.stringify(parsed, null, 2));
    console.log(`[calculateMatch] 计算完成: score=${parsed.score}, suggestions=${parsed.suggestions?.length || 0}`);

    // 验证必要字段
    if (typeof parsed.score !== 'number') {
      throw new Error('AI返回缺少score字段或类型错误');
    }
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error('AI返回缺少suggestions字段');
    }

    return parsed;
  } catch (e) {
    console.error(`[calculateMatch] JSON解析失败: ${(e as Error).message}`);
    console.error(`[calculateMatch] AI原始返回内容: ${result}`);
    throw new Error(`AI返回解析失败: ${(e as Error).message}`);
  }
}