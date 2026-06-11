import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, calculateMatch, AIConfig } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, capabilityProfile, aiConfig } = await request.json();
    
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: '简历文本不能为空' }, { status: 400 });
    }

    if (!aiConfig || !aiConfig.apiKey) {
      return NextResponse.json({ error: '请先配置AI服务商' }, { status: 400 });
    }

    const config: AIConfig = {
      provider: aiConfig.provider || 'deepseek',
      apiKey: aiConfig.apiKey,
      model: aiConfig.model || 'deepseek-chat',
    };

    const resumeAnalysis = await analyzeResume(resumeText, config);
    
    let matchResult = null;
    if (capabilityProfile && capabilityProfile.technicalSkills) {
      const jobRequirements = {
        technicalSkills: capabilityProfile.technicalSkills || [],
        softSkills: capabilityProfile.softSkills || [],
        experienceLevel: capabilityProfile.experienceLevel || '',
        educationRequirements: capabilityProfile.educationRequirements || [],
      };
      
      matchResult = await calculateMatch(jobRequirements, resumeAnalysis.skills, config);
    }

    const matchedSkills = resumeAnalysis.skills.filter(skill => 
      (capabilityProfile?.technicalSkills || []).includes(skill) ||
      (capabilityProfile?.softSkills || []).includes(skill)
    );

    const missingSkills = (capabilityProfile?.technicalSkills || []).filter(skill => 
      !resumeAnalysis.skills.includes(skill)
    );

    return NextResponse.json({
      keywords: resumeAnalysis.keywords,
      experience: resumeAnalysis.experience,
      skills: resumeAnalysis.skills,
      score: matchResult?.score || 0,
      matchedSkills,
      missingSkills: missingSkills.slice(0, 10),
      suggestions: matchResult?.suggestions || []
    });
  } catch (error) {
    console.error('分析简历失败:', error);
    return NextResponse.json({ error: '分析简历失败: ' + (error as Error).message }, { status: 500 });
  }
}
