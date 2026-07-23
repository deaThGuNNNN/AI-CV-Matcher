'use client';

import { useEffect, useRef } from 'react';
import type { AnalysisHistory } from '@/lib/storage';
import { Building2, Languages, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TailoredOutput } from './TailoredOutput';

interface MatchResultCardProps {
  result: AnalysisHistory;
}

function ScoreRing({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  
  const getColor = (s: number) => {
    if (s >= 7.5) return 'var(--primary)'; // Acid Yellow
    if (s >= 5) return '#fbbf24';          // amber-400
    return '#ef4444';                      // red-500
  };

  const color = getColor(score);

  return (
    <div 
      className="relative flex items-center justify-center w-24 h-24 rounded-full"
      style={{
        background: `conic-gradient(${color} ${percentage}%, var(--border) ${percentage}%)`
      }}
    >
      <div className="absolute inset-1 rounded-full bg-[var(--background)] flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[var(--foreground)]">{score.toFixed(1)}</span>
        <span className="text-[10px] text-[var(--muted-foreground)]">/ 10</span>
      </div>
    </div>
  );
}

function DimensionBar({ name, nameFr, score, feedback, feedbackFr, language }: {
  name: string;
  nameFr: string;
  score: number;
  feedback: string;
  feedbackFr: string;
  language: 'fr' | 'en';
}) {
  const label = language === 'fr' ? nameFr : name;
  const text = language === 'fr' ? feedbackFr : feedback;

  const getBarColor = (s: number) => {
    if (s >= 7.5) return 'bg-[var(--primary)]';
    if (s >= 5) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const getTextColor = (s: number) => {
    if (s >= 7.5) return 'text-[var(--foreground)]';
    if (s >= 5) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">{label}</span>
        <span className={`text-xs font-bold ${getTextColor(score)}`}>
          {score}/10
        </span>
      </div>
      <div className="h-2 rounded-none bg-[var(--secondary)] overflow-hidden border border-[var(--border)]">
        <div
          className={`h-full rounded-none ${getBarColor(score)} transition-all duration-700 ease-out`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{text}</p>
    </div>
  );
}

export function MatchResultCard({ result }: MatchResultCardProps) {
  const language = result.jobLanguage;
  const scoreLabel = language === 'fr' ? 'Score de correspondance' : 'Match Score';
  const detailsLabel = language === 'fr' ? 'Analyse détaillée' : 'Detailed Analysis';
  const strengthsLabel = language === 'fr' ? 'Points forts' : 'Strengths';
  const gapsLabel = language === 'fr' ? 'Points à améliorer' : 'Gaps';
  const keywordsLabel = language === 'fr' ? 'Mots-clés manquants' : 'Missing Keywords';

  return (
    <div className="p-4 space-y-5">
      {/* Downloads at the top */}
      <TailoredOutput result={result} />
      
      {/* Job Info */}
      <div className="rounded-none bg-[var(--background)] border border-[var(--foreground)] p-3 space-y-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[var(--foreground)] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] truncate">{result.jobTitle || 'Unknown Position'}</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">{result.company || 'Unknown Company'}</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none border bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)]">
              <Languages className="w-2.5 h-2.5" />
              {language === 'fr' ? 'FR' : 'EN'}
            </span>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{scoreLabel}</p>
        <ScoreRing score={result.score} />
        <div className="flex items-center gap-1.5 font-mono uppercase tracking-wide">
          {result.score >= 7.5 ? (
            <><CheckCircle2 className="w-4 h-4 text-[var(--foreground)]" /><span className="text-xs text-[var(--foreground)] font-bold">{language === 'fr' ? 'Excellent match' : 'Excellent match'}</span></>
          ) : result.score >= 5 ? (
            <><TrendingUp className="w-4 h-4 text-amber-500 dark:text-amber-400" /><span className="text-xs text-amber-500 dark:text-amber-400 font-bold">{language === 'fr' ? 'Match modéré' : 'Moderate match'}</span></>
          ) : (
            <><AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" /><span className="text-xs text-red-500 dark:text-red-400 font-bold">{language === 'fr' ? 'Match faible' : 'Weak match'}</span></>
          )}
        </div>
      </div>

      {/* Dimensions */}
      {result.dimensions?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[var(--foreground)]">{detailsLabel}</h3>
          <div className="space-y-4">
            {result.dimensions.map((dim, i) => (
              <DimensionBar key={i} {...dim} language={language} />
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {result.dimensions && (result.dimensions as any).strengths?.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">{strengthsLabel}</h3>
          <ul className="space-y-2">
            {((result.dimensions as any).strengths as string[]).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-medium text-[var(--foreground)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--primary)] bg-[var(--foreground)] rounded-full shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Keywords */}
      {(result as any).missingKeywords?.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{keywordsLabel}</h3>
          <div className="flex flex-wrap gap-2">
            {((result as any).missingKeywords as string[]).slice(0, 12).map((kw, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none border border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)]">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
