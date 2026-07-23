import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
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

// Amazon Bedrock (Claude 3.5 Sonnet)
async function callAmazonBedrock(prompt: string, apiKey: string): Promise<string> {
  // Optional custom key in format ACCESS_KEY:SECRET_KEY
  let credentials;
  if (apiKey && apiKey.includes(':')) {
    const [accessKeyId, secretAccessKey] = apiKey.split(':');
    credentials = { accessKeyId, secretAccessKey };
  }

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(credentials && { credentials }),
  });

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content?.[0]?.text || '';
  } catch (error) {
    const err = error as Error;
    throw new Error(`Amazon Bedrock API error: ${err.message}`);
  }
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
