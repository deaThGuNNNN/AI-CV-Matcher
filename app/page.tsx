import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] selection:bg-[var(--primary)] selection:text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[var(--primary)] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] border border-[var(--foreground)]">
            <span className="text-black font-bold text-lg leading-none mt-0.5">C</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--foreground)] tracking-wider uppercase">CareerOps</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/app"
            className="hidden sm:flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--foreground)] text-[var(--background)] border border-[var(--foreground)] rounded-none hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Subtle grid background for the brutalist tech vibe */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>

        <div className="max-w-4xl w-full space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded-none">
            <span className="w-2 h-2 bg-[var(--primary)] rounded-none animate-pulse border border-[var(--foreground)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">CareerOps AI Engine v2.0</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-[var(--foreground)]">
            Match.<br />
            <span className="text-[var(--primary)] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:drop-shadow-[4px_4px_0px_rgba(209,254,23,0.3)]">Tailor.</span><br />
            Hire.
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-[var(--muted-foreground)] font-medium leading-relaxed pt-4">
            Upload your CV. Drop a job link. Our AI engine instantly generates a tailored resume and cover letter designed specifically to beat ATS systems and impress recruiters.
          </p>

          <div className="pt-8">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-3 px-8 py-5 text-lg font-black uppercase tracking-widest bg-[var(--primary)] text-black border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(209,254,23,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(209,254,23,1)] transition-all group"
            >
              Start Matching
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[var(--border)] text-center shrink-0 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} CareerOps. Built for modern professionals.
        </p>
      </footer>
    </div>
  );
}
