import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, calculateMatch, AIConfig } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, capabilityProfile, aiConfig } = await request.json();

    console.log(`[analyze-resume] 收到请求: resumeTextLength=${resumeText?.length}`);

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: '简历文本不能为空' }, { status: 400 });
    }

    if (resumeText.trim().length === 0) {
      return NextResponse.json({ error: 'PDF解析失败，未能提取到文本内容' }, { status: 400 });
    }

    console.log(`[analyze-resume] PDF文本内容前200字符: ${resumeText.substring(0, 200)}`);

    if (!aiConfig || !aiConfig.apiKey) {
      return NextResponse.json({ error: '请先配置AI服务商' }, { status: 400 });
    }

    const config: AIConfig = {
      provider: aiConfig.provider || 'deepseek',
      apiKey: aiConfig.apiKey,
      model: aiConfig.model || 'deepseek-chat',
    };

    const resumeAnalysis = await analyzeResume(resumeText, config);

    console.log(`[analyze-resume] 简历分析完成: keywords=${resumeAnalysis.keywords.length}, skills=${resumeAnalysis.skills.length}`);

    let matchResult = null;
    if (capabilityProfile && capabilityProfile.technicalSkills) {
      const jobRequirements = {
        technicalSkills: capabilityProfile.technicalSkills || [],
        softSkills: capabilityProfile.softSkills || [],
        experienceLevel: capabilityProfile.experienceLevel || '',
        educationRequirements: capabilityProfile.educationRequirements || [],
      };

      console.log(`[analyze-resume] 开始计算匹配度: jobSkills=${jobRequirements.technicalSkills.length}`);

      matchResult = await calculateMatch(jobRequirements, resumeAnalysis.skills, config);

      console.log(`[analyze-resume] 匹配度计算完成: score=${matchResult.score}`);
    } else {
      console.log(`[analyze-resume] 跳过匹配度计算: capabilityProfile不存在`);
    }

    const technicalSkills = capabilityProfile?.technicalSkills || [];
    const softSkills = capabilityProfile?.softSkills || [];

    const matchedSkills = resumeAnalysis.skills.filter((skill: string) =>
      technicalSkills.includes(skill) || softSkills.includes(skill)
    );

    const missingSkills = technicalSkills.filter((skill: string) =>
      !resumeAnalysis.skills.includes(skill)
    );

    const result = {
      keywords: resumeAnalysis.keywords,
      experience: resumeAnalysis.experience,
      skills: resumeAnalysis.skills,
      score: matchResult?.score || 0,
      matchedSkills,
      missingSkills: missingSkills.slice(0, 10),
      suggestions: matchResult?.suggestions || []
    };

    console.log(`[analyze-resume] 返回结果: score=${result.score}, suggestions=${result.suggestions.length}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyze-resume] 分析简历失败:', error);
    return NextResponse.json({ error: '分析简历失败: ' + (error as Error).message }, { status: 500 });
  }
}