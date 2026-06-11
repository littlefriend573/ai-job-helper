import { NextRequest, NextResponse } from 'next/server';
import { calculateMatch, SkillProfile, AIConfig } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { jobRequirements, resumeSkills, aiConfig } = await request.json();

    console.log(`[calculate-match] 收到请求: jobSkills=${jobRequirements?.technicalSkills?.length}, resumeSkills=${resumeSkills?.length}`);

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

    console.log(`[calculate-match] 输入数据:`);
    console.log(`  岗位技术技能: ${jobRequirements.technicalSkills?.join(', ') || '无'}`);
    console.log(`  简历技能: ${resumeSkills?.join(', ') || '无'}`);

    const result = await calculateMatch(
      jobRequirements as SkillProfile,
      resumeSkills as string[],
      config
    );

    console.log(`[calculate-match] 返回结果: score=${result.score}, suggestions=${result.suggestions.length}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[calculate-match] 计算匹配度失败:', error);
    return NextResponse.json({ error: '计算匹配度失败: ' + (error as Error).message }, { status: 500 });
  }
}