import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface JDData {
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  education: string;
  description: string;
  requirements: string;
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { jds, source } = await request.json();
    
    if (!jds || !Array.isArray(jds) || jds.length === 0) {
      return NextResponse.json({ error: 'JD数据不能为空' }, { status: 400 });
    }

    const jobCollections = jds.map((jd: JDData) => ({
      position: jd.title,
      company: jd.company,
      location: jd.location,
      salary: jd.salary,
      experience: jd.experience,
      education: jd.education,
      description: jd.description,
      requirements: jd.requirements,
      source_url: jd.url,
      source: source || 'extension',
      created_at: new Date(jd.timestamp).toISOString(),
      metadata: JSON.stringify({
        extractedAt: jd.timestamp
      })
    }));

    const { data, error } = await supabase
      .from('job_collections')
      .insert(jobCollections)
      .select();

    if (error) {
      console.error('保存JD失败:', error);
      return NextResponse.json({ error: '保存JD失败: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      message: `成功保存 ${data?.length || 0} 个JD`
    });
  } catch (error) {
    console.error('导入JD失败:', error);
    return NextResponse.json({ error: '导入JD失败: ' + (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error, count } = await supabase
      .from('job_collections')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)
      .offset(offset);

    if (error) {
      console.error('获取JD列表失败:', error);
      return NextResponse.json({ error: '获取JD列表失败: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('获取JD列表失败:', error);
    return NextResponse.json({ error: '获取JD列表失败: ' + (error as Error).message }, { status: 500 });
  }
}