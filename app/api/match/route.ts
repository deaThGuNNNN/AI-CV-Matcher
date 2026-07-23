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

// Amazon Bedrock via Mantle (OpenAI-compatible endpoint)
async function callAmazonBedrock(prompt: string, apiKey: string): Promise<string> {
  const key = apiKey || process.env.MANTLE_API_KEY || '';
  if (!key) throw new Error('No Bedrock Mantle API key found.');

  const response = await fetch('https://bedrock-mantle.us-east-1.api.aws/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      // Swapped to deepseek.v3.1 temporarily while waiting for AWS Anthropic approval
      model: 'deepseek.v3.1', 
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Amazon Bedrock Mantle API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
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

    // API keys are now completely optional from the client.
    // If none is provided, the backend falls back to .env.local credentials.

    const prompt = buildMatchPrompt(cv, coverLetter || '', jobDescription);

    let rawText = '';

    switch (settings.provider) {
      case 'bedrock':
        rawText = await callAmazonBedrock(prompt, settings.apiKey);
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
