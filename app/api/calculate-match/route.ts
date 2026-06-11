import { NextRequest, NextResponse } from 'next/server';
import { calculateMatch, SkillProfile, AIConfig } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { jobRequirements, resumeSkills, aiConfig } = await request.json();
    
    if (!jobRequirements || !resumeSkills) {
      return NextResponse.json({ error: '参数不能为空' }, { status: 400 });
    }

    if (!aiConfig || !aiConfig.apiKey) {
      return NextResponse.json({ error: '请先配置AI服务商' }, { status: 400 });
    }

    const config: AIConfig = {
      provider: aiConfig.provider || 'deepseek',
      apiKey: aiConfig.apiKey,
      model: aiConfig.model || 'deepseek-chat',
    };

    const result = await calculateMatch(
      jobRequirements as SkillProfile, 
      resumeSkills as string[], 
      config
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('计算匹配度失败:', error);
    return NextResponse.json({ error: '计算匹配度失败: ' + (error as Error).message }, { status: 500 });
  }
}
