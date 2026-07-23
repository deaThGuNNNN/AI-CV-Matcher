'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProfilePanel } from '@/components/ProfilePanel';
import { JobInputPanel } from '@/components/JobInputPanel';
import { MatchResultCard } from '@/components/MatchResultCard';
import { HistoryPanel } from '@/components/HistoryPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { analyzeMatch } from '@/lib/ai';
import {
  getProfile,
  getSettings,
  getHistory,
  saveHistoryItem,
  type Profile,
  type AppSettings,
  type AnalysisHistory,
} from '@/lib/storage';
import { Settings, Briefcase, History, Sparkles, Check, ChevronRight, X, ArrowLeft, RotateCcw } from 'lucide-react';

export default function Home() {
  const [profile, setProfile] = useState<Profile>({ cv: '', coverLetter: '', name: '', email: '', phone: '' });
  const [settings, setSettings] = useState<AppSettings>({ apiKey: '', provider: 'gemini', defaultLanguage: 'auto' });
  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  const [currentResult, setCurrentResult] = useState<AnalysisHistory | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Wizard state: 1 = Profile, 2 = Job, 3 = Results
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    setProfile(getProfile());
    setSettings(getSettings());
    setHistory(getHistory());
  }, []);

  const handleAnalyze = useCallback(
    async (jobDescription: string) => {
      if (!profile.cv.trim()) {
        setError('Please add your CV first.');
        setStep(1);
        return;
      }
      // API key check removed because a default key is provided.

      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await analyzeMatch({ cv: profile.cv, coverLetter: profile.coverLetter, jobDescription, settings });
        const historyItem: AnalysisHistory = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          jobTitle: result.jobTitle,
          company: result.company,
          jobLanguage: result.jobLanguage,
          score: result.overallScore,
          dimensions: result.dimensions,
          tailoredCv: result.tailoredCv,
          tailoredCoverLetter: result.tailoredCoverLetter,
          jobDescription,
        };
        saveHistoryItem(historyItem);
        setCurrentResult(historyItem);
        setHistory(getHistory());
        setStep(3);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [profile, settings]
  );

  const handleSelectHistory = (item: AnalysisHistory) => {
    setCurrentResult(item);
    setStep(3);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[hsl(var(--border))] glass-panel z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep(1)}>
            <div className="w-8 h-8 rounded-none bg-[var(--primary)] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] border border-[var(--foreground)]">
              <span className="text-black font-bold text-lg leading-none mt-0.5">C</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[var(--foreground)] tracking-wider uppercase">CareerOps</h1>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest leading-none mt-0.5">AI CV Matcher</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings.provider === 'bedrock' && (
            <div className="flex items-center gap-2 text-[10px] text-[var(--background)] bg-[var(--foreground)] border border-[var(--foreground)] rounded-none px-3 py-1.5 font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)]">
              <Sparkles className="w-3 h-3 text-[var(--primary)]" />
              Amazon Bedrock
            </div>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-[10px] text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors px-3 py-1.5 rounded-none font-bold uppercase tracking-widest"
          >
            <History className="w-3 h-3" />
            History
          </button>
          <ThemeToggle />
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-[10px] text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors px-3 py-1.5 rounded-none font-bold uppercase tracking-widest"
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
        </div>
      </header>

      {/* Main Layout - Centered Wizard */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center pb-20">
        <div className="w-full max-w-4xl px-4 py-8 md:py-12 flex flex-col gap-8">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-3">
            {[
              { num: 1, title: 'Profile Setup' },
              { num: 2, title: 'Job Offer' },
              { num: 3, title: 'Results' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.num 
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg glow-primary scale-105'
                    : step > s.num 
                      ? 'bg-[var(--foreground)] text-[var(--background)] opacity-70 cursor-pointer hover:opacity-100'
                      : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                }`} onClick={() => { if (step > s.num) setStep(s.num as 1|2|3); }}>
                  {step > s.num ? <Check className="w-3 h-3" /> : <span>{s.num}</span>}
                  {s.title}
                </div>
                {i < 2 && <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] opacity-50" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <main className="w-full relative">
            {step === 1 && (
              <div className="slide-up max-w-2xl mx-auto border border-[var(--border)] bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden">
                <ProfilePanel 
                  profile={profile} 
                  onChange={setProfile} 
                  onNext={() => setStep(2)} 
                />
              </div>
            )}

            {step === 2 && (
              <div className="slide-up max-w-2xl mx-auto border border-[var(--border)] bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden h-[600px]">
                <JobInputPanel
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  error={error}
                  onClearError={() => setError(null)}
                  onBack={() => setStep(1)}
                />
              </div>
            )}

            {step === 3 && currentResult && (
              <div className="slide-up w-full flex flex-col gap-6">
                <div className="flex justify-between items-center bg-[var(--secondary)]/50 p-4 rounded-xl border border-[var(--border)] backdrop-blur-md">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--foreground)]">Analysis Complete</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">Review your match score and tailored documents below.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentResult(null);
                      setStep(2);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Match
                  </button>
                </div>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden h-full flex flex-col">
                  <MatchResultCard result={currentResult} />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* History Slide-out Sidebar */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowHistory(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-[100vw] bg-[var(--background)] border-l border-[var(--border)] z-50 shadow-2xl flex flex-col slide-left">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-[var(--foreground)]">
                <History className="w-4 h-4" /> History
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <HistoryPanel history={history} onSelect={handleSelectHistory} activeId={currentResult?.id} />
            </div>
          </div>
        </>
      )}

      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={(s) => {
            setSettings(s);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
