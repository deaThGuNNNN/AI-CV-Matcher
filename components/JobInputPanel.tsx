'use client';

import { useState } from 'react';
import { fetchJobDescription } from '@/lib/ai';
import { Link, FileText, Sparkles, X, AlertCircle, Loader2, Globe } from 'lucide-react';

interface JobInputPanelProps {
  onAnalyze: (jobDescription: string) => void;
  isAnalyzing: boolean;
  error: string | null;
  onClearError: () => void;
  onBack?: () => void;
}

export function JobInputPanel({ onAnalyze, isAnalyzing, error, onClearError, onBack }: JobInputPanelProps) {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const fetched = await fetchJobDescription(url.trim());
      setText(fetched);
      setMode('text');
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch URL');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAnalyze = () => {
    const jd = text.trim();
    if (!jd) return;
    onAnalyze(jd);
  };

  const canAnalyze = text.trim().length > 50 && !isAnalyzing;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] shrink-0">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">Job Offer</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Paste a job description or enter a URL — supports French & English
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] p-0.5 bg-[var(--secondary)] self-start">
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'text'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <FileText className="w-3 h-3" />
            Paste Text
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'url'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Globe className="w-3 h-3" />
            From URL
          </button>
        </div>

        {/* URL Input */}
        {mode === 'url' && (
          <div className="space-y-2 slide-up">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                <input
                  type="url"
                  placeholder="https://jobs.lever.co/company/job-id"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setFetchError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
              </div>
              <button
                onClick={handleFetchUrl}
                disabled={!url.trim() || isFetching}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-xl text-xs font-medium hover:bg-[var(--muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...</>
                ) : (
                  <>Fetch</>
                )}
              </button>
            </div>

            {fetchError && (
              <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{fetchError} Switch to "Paste Text" mode instead.</span>
              </div>
            )}

            {text && (
              <div className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <span>✓</span>
                Job description fetched ({text.length.toLocaleString()} chars). Scroll down to review, then Analyze.
              </div>
            )}
          </div>
        )}

        {/* Text Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">
              Job Description
            </label>
            {text && (
              <button
                onClick={() => { setText(''); setUrl(''); }}
                className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--destructive)] flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          <textarea
            placeholder={`Paste the full job description here...

💡 Tips for best results:
• Include the full job posting (requirements, responsibilities, company info)
• Works in French and English — the AI auto-detects the language
• The more detail, the more accurate the match score`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 min-h-[200px] px-4 py-3 text-sm rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none transition-all leading-relaxed"
          />
          {text && (
            <div className="mt-1 text-[10px] text-[var(--muted-foreground)] text-right">
              {text.length.toLocaleString()} characters
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 slide-up">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
            <button onClick={onClearError} className="shrink-0 hover:text-red-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              disabled={isAnalyzing}
              className="px-6 py-3.5 rounded-xl font-medium text-sm transition-all bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)] disabled:opacity-50 flex items-center justify-center"
            >
              Back
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              canAnalyze
                ? 'bg-[var(--primary)] text-black font-bold border border-[var(--primary)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] transition-all'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Match
              </>
            )}
          </button>
        </div>

        {isAnalyzing && (
          <div className="text-center slide-up">
            <div className="flex flex-col gap-2">
              {[
                'Reading job requirements...',
                'Comparing with your CV...',
                'Generating tailored content...',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <div className="w-2 h-2 rounded-none bg-black dark:bg-[var(--primary)] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
