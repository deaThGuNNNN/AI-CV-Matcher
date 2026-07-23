'use client';

import type { AnalysisHistory } from '@/lib/storage';
import { Building2, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HistoryPanelProps {
  history: AnalysisHistory[];
  onSelect: (item: AnalysisHistory) => void;
  activeId?: string;
}

function ScoreBadge({ score }: { score: number }) {
  const getScoreColor = (s: number) => 
    s >= 7.5 
    ? 'text-[var(--primary)] bg-[var(--background)] border-[var(--primary)]'
    : s >= 5 
    ? 'text-amber-500 bg-[var(--background)] border-amber-500'
    : 'text-red-500 bg-[var(--background)] border-red-500';

  const Icon = score >= 7.5 ? CheckCircle2 : score >= 5 ? TrendingUp : AlertTriangle;
  const color = getScoreColor(score);

  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      {score.toFixed(1)}
    </span>
  );
}

export function HistoryPanel({ history, onSelect, activeId }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center">
          <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">No history yet</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Your analyses will appear here
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="p-3 space-y-2">
      {history.map((item) => {
        const isSelected = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-3 rounded-none border transition-all ${
              isSelected 
              ? 'border-[var(--foreground)] bg-[var(--background)]'
              : 'border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--foreground)] hover:bg-[var(--background)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] truncate">
                  {item.jobTitle || 'Unknown position'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 className="w-2.5 h-2.5 text-[var(--muted-foreground)] shrink-0" />
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                    {item.company || 'Unknown company'}
                  </p>
                </div>
              </div>
              <ScoreBadge score={item.score} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-none font-bold uppercase tracking-widest border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)]">
                {item.jobLanguage === 'fr' ? 'FR' : 'EN'}
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                {formatDate(item.timestamp)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
