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
    model: 'Claude 3.5 Sonnet',
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
      <div className="relative z-10 w-full max-w-md rounded-none border-2 border-[var(--foreground)] bg-[var(--card)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(209,254,23,1)] slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--foreground)] bg-[var(--secondary)]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">Settings</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--foreground)] text-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Provider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[var(--primary)]" />
              <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]">AI Provider</label>
            </div>
            <div className="space-y-3">
              {PROVIDERS.filter((p) => p.free).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setForm((f) => ({ ...f, provider: provider.id }))}
                  className={`w-full p-4 border-2 text-left transition-all relative overflow-hidden ${
                    form.provider === provider.id
                      ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] translate-x-[-2px] translate-y-[-2px]'
                      : 'border-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-[12px] font-bold uppercase tracking-widest ${form.provider === provider.id ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{provider.name}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${form.provider === provider.id ? 'bg-[var(--primary)] text-black border-black' : 'bg-[var(--foreground)] text-[var(--background)] border-[var(--background)]'}`}>
                          DEFAULT
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 font-mono uppercase ${form.provider === provider.id ? 'text-[var(--background)]' : 'text-[var(--muted-foreground)]'}`}>{provider.model}</p>
                    </div>
                    <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                      form.provider === provider.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--foreground)] bg-[var(--background)]'
                    }`}>
                      {form.provider === provider.id && <div className="w-2.5 h-2.5 bg-black" />}
                    </div>
                  </div>
                  <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${form.provider === provider.id ? 'text-[var(--background)] opacity-80' : 'text-[var(--muted-foreground)]'}`}>Powered by AWS · No key required</p>
                </button>
              ))}

              {/* Other providers */}
              <div className="grid grid-cols-3 gap-3">
                {PROVIDERS.filter((p) => !p.free).map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setForm((f) => ({ ...f, provider: provider.id }))}
                    className={`p-3 border-2 text-left transition-all ${
                      form.provider === provider.id
                        ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] translate-x-[-2px] translate-y-[-2px]'
                        : 'border-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${form.provider === provider.id ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{provider.name}</p>
                    <p className={`text-[9px] mt-1 font-mono ${form.provider === provider.id ? 'text-[var(--background)] opacity-80' : 'text-[var(--muted-foreground)]'}`}>{provider.model}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[var(--primary)]" />
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]">API Key</label>
              </div>
              <a
                href={selectedProvider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] hover:opacity-80 transition-opacity"
              >
                Get key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Pre-configured Key Alert */}
            {!form.apiKey && (
              <div className="flex items-center gap-3 px-4 py-3 border-2 border-[var(--foreground)] bg-[var(--primary)]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)]">
                <div className="w-2.5 h-2.5 rounded-none bg-[var(--primary)] border border-[var(--foreground)] animate-pulse" />
                <div>
                  <p className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">Default Quota Active</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">No key required. Leave blank to use our default API quota.</p>
                </div>
              </div>
            )}

            <div className="relative group">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="OPTIONAL: ENTER YOUR OWN API KEY..."
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                className="w-full px-4 pr-12 py-3 text-xs border-2 border-[var(--foreground)] bg-[var(--input)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:bg-[var(--background)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] focus:-translate-y-[2px] focus:-translate-x-[2px] transition-all font-mono uppercase tracking-wider"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-50 hover:opacity-100 transition-opacity"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              <span className="text-[var(--primary)] mr-1">🔒</span> Stored locally. Never sent to any server except the AI provider.
            </p>
          </div>


          {/* Default Language */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--primary)]" />
              <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)]">Default Language</label>
            </div>
            <div className="flex gap-3">
              {(['auto', 'fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setForm((f) => ({ ...f, defaultLanguage: lang }))}
                  className={`flex-1 py-3 border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    form.defaultLanguage === lang
                      ? 'border-[var(--foreground)] bg-[var(--primary)] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] translate-x-[-2px] translate-y-[-2px]'
                      : 'border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                  }`}
                >
                  {lang === 'auto' ? '🌐 Auto' : lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t-2 border-[var(--foreground)] bg-[var(--secondary)] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border-2 border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border-2 border-[var(--foreground)] bg-[var(--primary)] text-black hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
