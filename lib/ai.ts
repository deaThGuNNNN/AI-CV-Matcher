import type { AppSettings } from './storage';

export interface MatchRequest {
  cv: string;
  coverLetter: string;
  jobDescription: string;
  settings: AppSettings;
}

export interface MatchResponse {
  jobTitle: string;
  company: string;
  jobLanguage: 'fr' | 'en';
  overallScore: number;
  dimensions: {
    name: string;
    nameFr: string;
    score: number;
    feedback: string;
    feedbackFr: string;
  }[];
  tailoredCv: string;
  tailoredCoverLetter: string;
  missingKeywords: string[];
  strengths: string[];
  gaps: string[];
}

export async function analyzeMatch(request: MatchRequest): Promise<MatchResponse> {
  const response = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchJobDescription(url: string): Promise<string> {
  const response = await fetch('/api/fetch-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Could not fetch URL' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}
