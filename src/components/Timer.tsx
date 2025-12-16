import { useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import { formatTime } from "../utils/time";

export const Timer = () => {
  const mode = usePomodoroStore((s) => s.mode);
  const secondsLeft = usePomodoroStore((s) => s.secondsLeft);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const completedWorkSessions = usePomodoroStore(
    (s) => s.completedWorkSessions
  );
  const tasks = usePomodoroStore((s) => s.tasks);
  const activeTaskId = usePomodoroStore((s) => s.activeTaskId);

  const setMode = usePomodoroStore((s) => s.setMode);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const reset = usePomodoroStore((s) => s.reset);
  const tick = usePomodoroStore((s) => s.tick);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, tick]);

  const currentTask = tasks.find((t) => t.id === activeTaskId);
  const nextLongBreakIn = 4 - (completedWorkSessions % 4 || 4);

  const modeLabel =
    mode === "work"
      ? "Work"
      : mode === "short_break"
      ? "Short break"
      : "Long break";

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] md:p-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="inline-flex rounded-full bg-slate-900/80 p-1 text-[11px] shadow-inner ring-1 ring-slate-700/80">
          <button
            type="button"
            onClick={() => setMode("work")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "work"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Work
          </button>
          <button
            type="button"
            onClick={() => setMode("short_break")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "short_break"
                ? "bg-sky-500 text-slate-950 shadow"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Short break
          </button>
          <button
            type="button"
            onClick={() => setMode("long_break")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "long_break"
                ? "bg-indigo-500 text-slate-50 shadow"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Long break
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="rounded-full bg-slate-900/80 px-2.5 py-1">
            Mode:{" "}
            <span className="font-medium text-slate-100">{modeLabel}</span>
          </span>
          <span className="hidden rounded-full bg-slate-900/80 px-2.5 py-1 md:inline">
            Classic Pomodoro
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 py-3 md:py-4">
        <div
          className={`relative inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 px-10 py-8 shadow-inner transition duration-300 md:px-14 md:py-10 ${
            isRunning ? "ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-slate-950" : ""
          }`}
        >
          <span className="text-5xl font-semibold tracking-tight tabular-nums md:text-6xl">
            {formatTime(Math.max(secondsLeft, 0))}
          </span>
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(16,185,129,0.3),transparent_45%,rgba(56,189,248,0.25),transparent_80%)] opacity-30 blur-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1 text-[11px] text-slate-400">
          <p className="line-clamp-1">
            Current task:{" "}
            <span className="font-medium text-slate-100">
              {currentTask ? currentTask.name : "No active task selected"}
            </span>
          </p>
          <p className="hidden md:block">
            Tip: click a task on the right to focus this timer on it.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={pause}
            className="min-w-[130px] rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md hover:bg-slate-200"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="min-w-[130px] rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-emerald-400"
          >
            Start
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="min-w-[100px] rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2.5 text-xs font-medium text-slate-200 hover:border-slate-400"
        >
          Reset
        </button>
      </div>

      <div className="mt-1 flex flex-col items-center justify-between gap-1 text-[11px] text-slate-500 md:flex-row">
        <span>Pomodoros completed: {completedWorkSessions}</span>
        <span>Next long break in: {nextLongBreakIn} pomodoro(s)</span>
      </div>
    </div>
  );
};


