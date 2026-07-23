export interface Profile {
  cv: string;
  coverLetter: string;
  name: string;
  email: string;
  phone: string;
}

export interface AnalysisHistory {
  id: string;
  timestamp: number;
  jobTitle: string;
  company: string;
  jobLanguage: 'fr' | 'en';
  score: number;
  dimensions: ScoreDimension[];
  tailoredCv: string;
  tailoredCoverLetter: string;
  jobDescription: string;
}

export interface ScoreDimension {
  name: string;
  nameFr: string;
  score: number;
  feedback: string;
  feedbackFr: string;
}

export interface AppSettings {
  apiKey: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'bedrock';
  defaultLanguage: 'auto' | 'fr' | 'en';
}

const PROFILE_KEY = 'career_ops_profile';
const HISTORY_KEY = 'career_ops_history';
const SETTINGS_KEY = 'career_ops_settings';

export const defaultProfile: Profile = {
  cv: '',
  coverLetter: '',
  name: '',
  email: '',
  phone: '',
};

export const defaultSettings: AppSettings = {
  apiKey: '',
  provider: 'bedrock',
  defaultLanguage: 'auto',
};

export function getProfile(): Profile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getHistory(): AnalysisHistory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: AnalysisHistory): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const filtered = history.filter((h) => h.id !== item.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...filtered].slice(0, 50)));
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
