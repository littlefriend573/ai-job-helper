import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请上传简历文件' }, { status: 400 });
    }

    if (!file.type.startsWith('application/pdf')) {
      return NextResponse.json({ error: '只支持PDF格式的简历' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(arrayBuffer);

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('解析简历失败:', error);
    return NextResponse.json({ error: '解析简历失败' }, { status: 500 });
  }
}
