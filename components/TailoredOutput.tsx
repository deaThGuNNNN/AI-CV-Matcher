'use client';

import { useState } from 'react';
import type { AnalysisHistory } from '@/lib/storage';
import { FileText, Mail, Download, Loader2 } from 'lucide-react';
import { marked } from 'marked';

interface TailoredOutputProps {
  result: AnalysisHistory;
}

function PdfDownloadButton({
  content,
  filename,
  label,
  accent,
}: {
  content: string;
  filename: string;
  label: string;
  accent: 'blue' | 'purple';
}) {
  const [isExporting, setIsExporting] = useState(false);
  const isLatex = content.includes('\\documentclass') || content.includes('\\section') || content.includes('\\begin{');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (isLatex) {
        const response = await fetch('/api/compile-latex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latex: content }),
        });
        
        if (!response.ok) throw new Error('Failed to compile LaTeX');
        
        const blob = await response.blob();
        const { saveAs } = await import('file-saver');
        saveAs(blob, `${filename}.pdf`);
      } else {
        // Non-LaTeX fallback: Markdown to HTML to Native Print
        const htmlContent = await marked.parse(content);
        
        const documentHtml = `
          <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; max-width: 800px; margin: 0 auto; padding: 20px;">
            ${htmlContent}
          </div>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <title>${filename}</title>
                <style>
                  @media print {
                    body { -webkit-print-color-adjust: exact; }
                    @page { margin: 15mm; }
                  }
                </style>
              </head>
              <body>
                ${documentHtml}
              </body>
            </html>
          `);
          iframeDoc.close();
          
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    } catch (error) {
      console.error(`PDF export failed:`, error);
      alert(`Export failed. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const containerClasses = "w-full flex items-center justify-between p-4 rounded-none border border-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--foreground)] hover:text-[var(--background)] group transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const iconClasses = "p-2 rounded-none bg-[var(--secondary)] group-hover:bg-[var(--background)] text-[var(--foreground)] transition-colors";

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={containerClasses}
    >
      <div className="flex items-center gap-3">
        <div className={iconClasses}>
          {accent === 'blue' ? <FileText className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
        </div>
        <div className="text-left font-mono uppercase tracking-wide">
          <span className="block font-bold text-sm">{label}</span>
          <span className="text-[10px] opacity-70">Download PDF</span>
        </div>
      </div>
      
      <div className={`p-2 rounded-none ${isExporting ? '' : 'bg-[var(--primary)] text-black shadow-sm group-hover:bg-[#D1FE17] transition-colors'}`}>
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--foreground)] group-hover:text-[var(--background)]" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </div>
    </button>
  );
}

export function TailoredOutput({ result }: TailoredOutputProps) {
  const language = result.jobLanguage;
  const cvLabel = language === 'fr' ? 'CV personnalisé' : 'Tailored CV';
  const clLabel = language === 'fr' ? 'Lettre de motivation' : 'Tailored Cover Letter';

  return (
    <div className="space-y-3 pb-2">
      {result.tailoredCv && (
        <PdfDownloadButton
          content={result.tailoredCv}
          filename={`CV_${result.jobTitle.replace(/[^a-zA-Z0-9-]/g, '_')}`}
          label={cvLabel}
          accent="blue"
        />
      )}
      
      {result.tailoredCoverLetter && (
        <PdfDownloadButton
          content={result.tailoredCoverLetter}
          filename={`CoverLetter_${result.jobTitle.replace(/[^a-zA-Z0-9-]/g, '_')}`}
          label={clLabel}
          accent="purple"
        />
      )}

      {!result.tailoredCv && !result.tailoredCoverLetter && (
        <div className="rounded-xl border border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
          No documents generated
        </div>
      )}
    </div>
  );
}
