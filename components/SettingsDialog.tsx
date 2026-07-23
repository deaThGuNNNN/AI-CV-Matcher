'use client';

import { useState } from 'react';
import { saveSettings, type AppSettings } from '@/lib/storage';
import { X, Key, Bot, Globe, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SettingsDialogProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const PROVIDERS = [
  {
    id: 'bedrock' as const,
    name: 'Amazon Bedrock',
    model: 'Claude Haiku 4.5',
    hint: '🆓 Default quota active',
    url: 'https://aws.amazon.com/bedrock/',
    color: 'text-[var(--primary)]',
    free: true,
  },
  {
    id: 'gemini' as const,
    name: 'Google Gemini',
    model: 'gemini-2.0-flash',
    hint: 'Free tier available',
    url: 'https://aistudio.google.com/app/apikey',
    color: 'text-blue-400',
    free: false,
  },
  {
    id: 'openai' as const,
    name: 'OpenAI',
    model: 'gpt-4o',
    hint: 'Requires paid plan',
    url: 'https://platform.openai.com/api-keys',
    color: 'text-emerald-400',
    free: false,
  },
  {
    id: 'anthropic' as const,
    name: 'Anthropic Claude',
    model: 'claude-3-5-sonnet',
    hint: 'Requires paid plan',
    url: 'https://console.anthropic.com/keys',
    color: 'text-purple-400',
    free: false,
  },
];


export function SettingsDialog({ settings, onSave, onClose }: SettingsDialogProps) {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [showKey, setShowKey] = useState(false);

  const selectedProvider = PROVIDERS.find((p) => p.id === form.provider) ?? PROVIDERS[0];

  const handleSave = () => {
    saveSettings(form);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Settings</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* AI Provider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <label className="text-xs font-semibold text-[var(--foreground)]">AI Provider</label>
            </div>
            <div className="space-y-2">
              {PROVIDERS.filter((p) => p.free).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setForm((f) => ({ ...f, provider: provider.id }))}
                  className={`w-full p-3 rounded-none border text-left transition-all relative overflow-hidden ${
                    form.provider === provider.id
                      ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                      : 'border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${form.provider === provider.id ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{provider.name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-none bg-[var(--primary)] text-black border border-black uppercase">
                          DEFAULT
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${form.provider === provider.id ? 'text-[var(--background)]' : 'text-[var(--muted-foreground)]'}`}>{provider.model}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-none border-2 flex items-center justify-center ${
                      form.provider === provider.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
                    }`}>
                      {form.provider === provider.id && <div className="w-2 h-2 rounded-none bg-black" />}
                    </div>
                  </div>
                  <p className={`text-[9px] mt-1 uppercase tracking-wider ${form.provider === provider.id ? 'text-[var(--background)] opacity-70' : 'text-[var(--muted-foreground)]'}`}>Powered by AWS · No key required</p>
                </button>
              ))}

              {/* Other providers */}
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.filter((p) => !p.free).map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setForm((f) => ({ ...f, provider: provider.id }))}
                    className={`p-2.5 rounded-none border text-left transition-all ${
                      form.provider === provider.id
                        ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                        : 'border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--foreground)]'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${form.provider === provider.id ? 'text-[var(--background)]' : 'text-[var(--foreground)]'}`}>{provider.name}</p>
                    <p className={`text-[9px] mt-0.5 ${form.provider === provider.id ? 'text-[var(--background)] opacity-70' : 'text-[var(--muted-foreground)]'}`}>{provider.model}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <label className="text-xs font-semibold text-[var(--foreground)]">API Key</label>
              </div>
              <a
                href={selectedProvider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                Get key
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Pre-configured Key Alert */}
            {!form.apiKey && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-none border-l-4 border-[var(--primary)] bg-[var(--primary)]/10">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <div>
                  <p className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider">Default Quota Active</p>
                  <p className="text-[9px] text-[var(--muted-foreground)]">No key required. Leave blank to use our default API quota.</p>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Optional: Enter your own API key..."
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                className="w-full px-3 pr-10 py-2.5 text-xs rounded-none bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] transition-all font-mono uppercase tracking-wider"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              🔒 Stored only in your browser's localStorage. Never sent to any server except the AI provider directly.
            </p>
          </div>


          {/* Default Language */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <label className="text-xs font-semibold text-[var(--foreground)]">Default Language</label>
            </div>
            <div className="flex gap-2">
              {(['auto', 'fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setForm((f) => ({ ...f, defaultLanguage: lang }))}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                    form.defaultLanguage === lang
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                      : 'border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {lang === 'auto' ? '🌐 Auto' : lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Auto-detect reads the job description language and responds accordingly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none border border-[var(--foreground)] bg-[var(--foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)] text-[var(--background)] transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
