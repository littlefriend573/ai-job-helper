import { NextRequest, NextResponse } from 'next/server';
import { providers, ProviderType } from '@/app/settings/page';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { success: false, message: '参数不能为空' },
        { status: 400 }
      );
    }

    const config = providers[provider as ProviderType];
    if (!config) {
      return NextResponse.json(
        { success: false, message: '未知的API提供商' },
        { status: 400 }
      );
    }

    let response;
    let success = false;

    try {
      switch (provider) {
        case 'deepseek':
          response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: '请回复：连接成功' }],
              max_tokens: 10,
            }),
            timeout: 10000,
          });
          if (response.ok) {
            const data = await response.json();
            success = data.choices?.[0]?.message?.content?.includes('连接成功') ?? false;
          }
          break;

        case 'glm':
          response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: '请回复：连接成功' }],
              max_tokens: 10,
            }),
            timeout: 10000,
          });
          if (response.ok) {
            const data = await response.json();
            success = data.choices?.[0]?.message?.content?.includes('连接成功') ?? false;
          }
          break;

        case 'qwen':
          response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              input: {
                messages: [{ role: 'user', content: '请回复：连接成功' }],
              },
              parameters: { max_tokens: 10 },
            }),
            timeout: 10000,
          });
          if (response.ok) {
            const data = await response.json();
            success = data.output?.text?.includes('连接成功') ?? false;
          }
          break;

        case 'siliconflow':
          response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: '请回复：连接成功' }],
              max_tokens: 10,
            }),
            timeout: 10000,
          });
          if (response.ok) {
            const data = await response.json();
            success = data.choices?.[0]?.message?.content?.includes('连接成功') ?? false;
          }
          break;

        default:
          return NextResponse.json(
            { success: false, message: '该服务商暂不支持测试' },
            { status: 400 }
          );
      }

      if (success) {
        return NextResponse.json({ success: true, message: '连接成功' });
      } else {
        return NextResponse.json(
          { success: false, message: 'API Key无效或模型不可用' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      return NextResponse.json(
        { success: false, message: '连接失败，请检查网络或API Key' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('请求解析失败:', error);
    return NextResponse.json(
      { success: false, message: '请求解析失败' },
      { status: 400 }
    );
  }
}
