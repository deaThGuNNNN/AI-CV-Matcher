import { NextRequest, NextResponse } from 'next/server';
import { buildMatchPrompt } from '@/lib/prompts';
import type { AppSettings } from '@/lib/storage';

export const maxDuration = 60;

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// NVIDIA NIM — OpenAI-compatible endpoint (free tier)
// Uses DeepSeek V4 Flash with thinking/reasoning enabled
async function callNvidiaDeepSeek(prompt: string, apiKey: string): Promise<string> {
  // Fall back to env var if no key passed from UI
  const key = apiKey || process.env.NVIDIA_API_KEY || '';
  if (!key) throw new Error('No NVIDIA API key found. Add it in Settings or set NVIDIA_API_KEY in .env.local');

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      stream: false,
      chat_template_kwargs: {
        thinking: true,
        reasoning_effort: 'high',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `NVIDIA API error: ${response.status}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;

  // Extract reasoning content if present (DeepSeek thinking mode)
  const reasoning: string =
    message?.reasoning ?? message?.reasoning_content ?? '';

  const content: string = message?.content ?? '';

  // Return just the content — reasoning is internal chain-of-thought
  // but if content is empty, fall back to reasoning
  return content || reasoning;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cv, coverLetter, jobDescription, settings } = body as {
      cv: string;
      coverLetter: string;
      jobDescription: string;
      settings: AppSettings;
    };

    if (!cv || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description are required' }, { status: 400 });
    }

    if (!settings?.apiKey) {
      // For NVIDIA, the key can come from the env var — skip the check
      const isNvidiaWithEnvKey =
        settings?.provider === 'nvidia' && !!process.env.NVIDIA_API_KEY;
      if (!isNvidiaWithEnvKey) {
        return NextResponse.json(
          { error: 'API key is required. Please add one in Settings.' },
          { status: 400 }
        );
      }
    }

    const prompt = buildMatchPrompt(cv, coverLetter || '', jobDescription);

    let rawText = '';

    switch (settings.provider) {
      case 'nvidia':
        rawText = await callNvidiaDeepSeek(prompt, settings.apiKey);
        break;
      case 'openai':
        rawText = await callOpenAI(prompt, settings.apiKey);
        break;
      case 'anthropic':
        rawText = await callAnthropic(prompt, settings.apiKey);
        break;
      case 'gemini':
      default:
        rawText = await callGemini(prompt, settings.apiKey);
        break;
    }

    // Strip markdown code block if present
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();

    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
