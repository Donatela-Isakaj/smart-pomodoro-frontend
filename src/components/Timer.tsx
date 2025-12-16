import { useEffect, useRef, useState } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import { formatTime } from "../utils/time";

const showNotification = (title: string, message: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "pomodoro-timer",
      requireInteraction: false
    });
  } else if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "pomodoro-timer"
        });
      }
    });
  }
};

export const Timer = () => {
  const mode = usePomodoroStore((s) => s.mode);
  const secondsLeft = usePomodoroStore((s) => s.secondsLeft);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const completedWorkSessions = usePomodoroStore((s) => s.completedWorkSessions);
  const setMode = usePomodoroStore((s) => s.setMode);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const tick = usePomodoroStore((s) => s.tick);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const prevSecondsLeft = useRef(secondsLeft);
  const hasNotified = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, tick]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Detect when timer reaches zero
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      hasNotified.current = false;
    }

    if (isRunning && prevSecondsLeft.current > 0 && secondsLeft <= 0 && !hasNotified.current) {
      hasNotified.current = true;
      
      const modeLabel = mode === "work" ? "Pomodoro" : mode === "short_break" ? "Short Break" : "Long Break";
      const message = mode === "work" ? "Time's up! Take a break." : "Break is over! Time to focus.";
      
      showNotification(`${modeLabel} Complete!`, message);
    }

    prevSecondsLeft.current = secondsLeft;
  }, [secondsLeft, isRunning, mode]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    // YouTube iframe API would be used here, but for simplicity we'll use embed
  };

  const getModeLabel = () => {
    if (mode === "work") return "Focus Time";
    if (mode === "short_break") return "Short Break";
    return "Long Break";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {/* Timer Display - Extra Large and Centered */}
      <div className="mb-16 text-center">
        <div className="mb-6 text-[10rem] md:text-[14rem] font-extralight text-white tabular-nums tracking-tighter leading-none">
          {formatTime(Math.max(secondsLeft, 0))}
        </div>
        <p className="text-2xl md:text-3xl text-white/70 font-light mb-12">
          {getModeLabel()}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-6 mb-16">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="group relative px-16 py-5 rounded-full bg-white text-gray-800 text-xl font-medium shadow-2xl hover:shadow-3xl transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
        >
          <span className="relative z-10">{isRunning ? "Pause" : "Start"}</span>
        </button>
        
        <button
          type="button"
          onClick={toggleMusic}
          className={`p-5 rounded-full transition-all backdrop-blur-sm ${
            isMusicPlaying 
              ? "bg-white/30 text-white shadow-lg" 
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
          aria-label="Toggle music"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            {isMusicPlaying ? (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            ) : (
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mode Selector - Minimal and Elegant */}
      <div className="flex gap-3 mb-12">
        <button
          type="button"
          onClick={() => setMode("work")}
          className={`px-8 py-3 rounded-full text-base font-light transition-all backdrop-blur-sm ${
            mode === "work"
              ? "bg-white/25 text-white shadow-lg"
              : "text-white/60 hover:text-white/90 hover:bg-white/10"
          }`}
        >
          Focus
        </button>
        <button
          type="button"
          onClick={() => setMode("short_break")}
          className={`px-8 py-3 rounded-full text-base font-light transition-all backdrop-blur-sm ${
            mode === "short_break"
              ? "bg-white/25 text-white shadow-lg"
              : "text-white/60 hover:text-white/90 hover:bg-white/10"
          }`}
        >
          Short Break
        </button>
        <button
          type="button"
          onClick={() => setMode("long_break")}
          className={`px-8 py-3 rounded-full text-base font-light transition-all backdrop-blur-sm ${
            mode === "long_break"
              ? "bg-white/25 text-white shadow-lg"
              : "text-white/60 hover:text-white/90 hover:bg-white/10"
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Lofi Music Player - Elegant and Minimal */}
      {isMusicPlaying && (
        <div className="mt-8 w-full max-w-lg animate-fade-in">
          <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md shadow-2xl border border-white/20">
            <iframe
              ref={iframeRef}
              width="100%"
              height="200"
              src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk"
              title="Lofi Music"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};
