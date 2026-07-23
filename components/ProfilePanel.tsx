'use client';

import { useCallback, useRef, useState } from 'react';
import { saveProfile, type Profile } from '@/lib/storage';
import {
  FileText,
  Upload,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface ProfilePanelProps {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onNext?: () => void;
}

interface UploadZoneProps {
  onText: (text: string, fileName: string) => void;
  accept?: string;
  label: string;
  accent: 'blue' | 'purple';
}

function UploadZone({ onText, label, accent }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const styles = {
    dropzone: {
      border: isDragging ? 'border-[var(--foreground)] bg-[var(--foreground)]/5' : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)] hover:bg-[var(--secondary)]',
      icon: 'text-[var(--foreground)]',
      badge: 'bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)] font-bold tracking-wider uppercase',
    },
  };

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setUploadedFile(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      onText(data.text, data.fileName);
      setUploadedFile(`${data.fileName} · ${data.lineCount} lines · ${(data.charCount / 1000).toFixed(1)}k chars`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  }, [onText]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${styles.dropzone.border}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.rtf,.tex,.latex"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center gap-2 py-5 px-3 text-center">
          {isLoading ? (
            <>
              <Loader2 className={`w-6 h-6 ${styles.dropzone.icon} animate-spin`} />
              <p className="text-xs text-[var(--muted-foreground)]">Extracting text…</p>
            </>
          ) : (
            <>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.dropzone.badge}`}>
                <FileUp className={`w-4 h-4 ${styles.dropzone.icon}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">
                  {isDragging ? 'Drop to upload' : label}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                  PDF · DOCX · TEX · MD · TXT
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadedFile && (
        <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border ${styles.dropzone.badge}`}>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{uploadedFile}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-2.5 py-1.5">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function ProfilePanel({ profile, onChange, onNext }: ProfilePanelProps) {
  const update = useCallback(
    (key: keyof Profile, value: string) => {
      const next = { ...profile, [key]: value };
      onChange(next);
      saveProfile(next);
    },
    [profile, onChange]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--background)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border)] shrink-0">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Your Documents</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Upload your CV and Cover Letter templates. Our AI will automatically extract your details.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        {/* CV Upload */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--foreground)]">
              <FileText className="w-4 h-4 text-[var(--foreground)]" />
              CV / Résumé
            </h3>
            {profile.cv && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--foreground)] bg-[var(--secondary)] px-2 py-1 rounded-none border border-[var(--border)] font-bold uppercase tracking-wider">
                  {profile.cv.split('\n').filter(Boolean).length} lines detected
                </span>
                <button
                  onClick={() => update('cv', '')}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                  title="Clear CV"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="p-1">
             <UploadZone
              label="Drop your CV here or click to browse"
              accent="blue"
              onText={(text) => update('cv', text)}
            />
          </div>
        </div>

        {/* Cover Letter Upload */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--foreground)]">
              <FileText className="w-4 h-4 text-[var(--foreground)]" />
              Cover Letter Template
            </h3>
             {profile.coverLetter && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--foreground)] bg-[var(--secondary)] px-2 py-1 rounded-none border border-[var(--border)] font-bold uppercase tracking-wider">
                  {profile.coverLetter.split('\n').filter(Boolean).length} lines detected
                </span>
                <button
                  onClick={() => update('coverLetter', '')}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                  title="Clear Cover Letter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-1">
             <UploadZone
              label="Drop your Cover Letter here or click to browse"
              accent="purple"
              onText={(text) => update('coverLetter', text)}
            />
          </div>
        </div>

      </div>

      {/* Wizard Next Button */}
      {onNext && (
        <div className="p-6 pt-0 shrink-0">
          <button
            onClick={onNext}
            disabled={!profile.cv.trim()}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-none font-bold text-sm transition-all ${
              profile.cv.trim()
                ? 'bg-[var(--primary)] text-black border border-[var(--primary)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(209,254,23,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] cursor-not-allowed'
            }`}
          >
            Continue to Job Offer
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
