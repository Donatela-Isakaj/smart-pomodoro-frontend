import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.15),transparent_55%)]" />
      <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="space-y-0.5">
            <h1 className="text-base font-semibold tracking-tight md:text-lg">
              Smart Pomodoro Tracker
            </h1>
            <p className="text-[11px] text-slate-400 md:text-xs">
              Classic Pomodoro with tasks & focus stats, ready for Cloudflare.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <div className="hidden items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Local mode</span>
            </div>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-sm transition hover:border-emerald-400 hover:text-emerald-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4 md:py-6">{children}</main>
    </div>
  );
};


