import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SettingsModal } from "./SettingsModal";
import { ReportModal } from "./ReportModal";

type Props = {
  children: ReactNode;
};

const BACKGROUND_COLOR_KEY = "pomofocus-background-color";

export const Layout = ({ children }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    // Load background color from localStorage on mount
    const savedColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
    if (savedColor) {
      document.body.style.background = savedColor;
      setBackgroundColor(savedColor);
    } else {
      // Default gradient
      const defaultGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
      document.body.style.background = defaultGradient;
      setBackgroundColor(defaultGradient);
    }
  }, []);

  const handleBackgroundColorChange = (color: string) => {
    document.body.style.background = color;
    setBackgroundColor(color);
    localStorage.setItem(BACKGROUND_COLOR_KEY, color);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse-slow"></div>
      </div>

      {/* Header - Minimal */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="text-white/80 text-sm font-light">Pomodoro</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-sm"
            aria-label="View Report"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-sm"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={handleBackgroundColorChange}
      />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
};
