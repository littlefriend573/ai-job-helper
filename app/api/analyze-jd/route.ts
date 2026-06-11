import { NextRequest, NextResponse } from 'next/server';
import { analyzeJD, AIConfig } from '@/lib/ai';

interface JDAnalysisResult {
  keywords: string[];
  skillProfile: {
    technicalSkills: string[];
    softSkills: string[];
    experienceLevel: string;
    educationRequirements: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { position, jds, aiConfig } = await request.json();

    console.log(`[analyze-jd] 收到请求: position=${position}, jdCount=${jds?.length}`);

    if (!jds || !Array.isArray(jds) || jds.length === 0) {
      return NextResponse.json({ error: 'JD列表不能为空' }, { status: 400 });
    }

    if (!aiConfig || !aiConfig.apiKey) {
      return NextResponse.json({ error: '请先配置AI服务商' }, { status: 400 });
    }

    const config: AIConfig = {
      provider: aiConfig.provider || 'deepseek',
      apiKey: aiConfig.apiKey,
      model: aiConfig.model || 'deepseek-chat',
    };

    const allResults: JDAnalysisResult[] = [];

    for (const jdText of jds) {
      if (jdText && jdText.trim()) {
        console.log(`[analyze-jd] 分析第${allResults.length + 1}条JD, length=${jdText.length}`);
        const result = await analyzeJD(jdText, config);
        allResults.push(result);
      }
    }

    if (allResults.length === 0) {
      return NextResponse.json({ error: '没有有效的JD内容' }, { status: 400 });
    }

    const combinedResult = combineJDAnalysis(allResults, position);

    console.log(`[analyze-jd] 分析完成: keywords=${combinedResult.keywords.length}, skills=${combinedResult.skills.length}`);

    return NextResponse.json(combinedResult);
  } catch (error) {
    console.error('[analyze-jd] 分析JD失败:', error);
    return NextResponse.json({ error: '分析JD失败: ' + (error as Error).message }, { status: 500 });
  }
}

function combineJDAnalysis(results: JDAnalysisResult[], position?: string) {
  console.log(`[combineJDAnalysis] 合并${results.length}条JD分析结果, position=${position}`);

  const keywords: string[] = [];
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const experienceLevels: string[] = [];
  const educationRequirements: string[] = [];

  const keywordCount: Record<string, number> = {};
  const techSkillCount: Record<string, number> = {};
  const softSkillCount: Record<string, number> = {};
  const eduCount: Record<string, number> = {};

  results.forEach((result: JDAnalysisResult) => {
    result.keywords.forEach((k: string) => {
      keywordCount[k] = (keywordCount[k] || 0) + 1;
    });
    result.skillProfile.technicalSkills.forEach((s: string) => {
      techSkillCount[s] = (techSkillCount[s] || 0) + 1;
    });
    result.skillProfile.softSkills.forEach((s: string) => {
      softSkillCount[s] = (softSkillCount[s] || 0) + 1;
    });
    if (result.skillProfile.experienceLevel) {
      experienceLevels.push(result.skillProfile.experienceLevel);
    }
    result.skillProfile.educationRequirements.forEach((e: string) => {
      eduCount[e] = (eduCount[e] || 0) + 1;
    });
  });

  const threshold = Math.ceil(results.length * 0.5);

  Object.entries(keywordCount).forEach(([k, v]: [string, number]) => {
    if (v >= threshold) keywords.push(k);
  });
  Object.entries(techSkillCount).forEach(([s, v]: [string, number]) => {
    if (v >= threshold) technicalSkills.push(s);
  });
  Object.entries(softSkillCount).forEach(([s, v]: [string, number]) => {
    if (v >= threshold) softSkills.push(s);
  });
  Object.entries(eduCount).forEach(([e, v]: [string, number]) => {
    if (v >= threshold) educationRequirements.push(e);
  });

  const commonExperience = experienceLevels.length > 0
    ? experienceLevels.reduce((a: string, b: string) => a.length >= b.length ? a : b)
    : '';

  const result = {
    keywords: keywords.slice(0, 20),
    skills: technicalSkills.slice(0, 15),
    requirements: [
      ...technicalSkills.slice(0, 10),
      ...softSkills.slice(0, 5)
    ],
    capabilityProfile: {
      position,
      technicalSkills: technicalSkills.slice(0, 15),
      softSkills: softSkills.slice(0, 10),
      experienceLevel: commonExperience,
      educationRequirements: educationRequirements.slice(0, 5),
      frequencyAnalysis: {
        totalJDs: results.length,
        keywordFrequency: keywordCount,
        skillFrequency: techSkillCount
      },
      commonRequirements: {
        mustHave: technicalSkills.slice(0, 5),
        niceToHave: technicalSkills.slice(5, 10)
      }
    }
  };

  console.log(`[combineJDAnalysis] 合并完成: keywords=${result.keywords.length}, skills=${result.skills.length}`);
  return result;
}