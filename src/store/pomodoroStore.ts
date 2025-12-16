import { create } from "zustand";

export type SessionType = "work" | "break";

export type Task = {
  id: string;
  name: string;
  category?: string;
  createdAt: string;
};

export type Session = {
  id: string;
  taskId: string | null;
  startTime: string;
  endTime: string;
  duration: number;
  type: SessionType;
};

type Mode = "work" | "short_break" | "long_break";

type PomodoroState = {
  mode: Mode;
  secondsLeft: number;
  isRunning: boolean;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  completedWorkSessions: number;
  tasks: Task[];
  activeTaskId: string | null;
  sessions: Session[];
  lastTick: number | null;
};

type PomodoroActions = {
  setMode: (mode: Mode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  addTask: (name: string, category?: string) => void;
  setActiveTask: (taskId: string) => void;
};

const STORAGE_KEY = "smart-pomodoro-state-v1";

const defaultDurations = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60
};

const loadInitialState = (): PomodoroState => {
  if (typeof window === "undefined") {
    return {
      mode: "work",
      secondsLeft: defaultDurations.work,
      isRunning: false,
      workDuration: defaultDurations.work,
      shortBreakDuration: defaultDurations.short_break,
      longBreakDuration: defaultDurations.long_break,
      completedWorkSessions: 0,
      tasks: [],
      activeTaskId: null,
      sessions: [],
      lastTick: null
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        mode: "work",
        secondsLeft: defaultDurations.work,
        isRunning: false,
        workDuration: defaultDurations.work,
        shortBreakDuration: defaultDurations.short_break,
        longBreakDuration: defaultDurations.long_break,
        completedWorkSessions: 0,
        tasks: [],
        activeTaskId: null,
        sessions: [],
        lastTick: null
      };
    }
    const parsed = JSON.parse(raw) as PomodoroState;
    return { ...parsed, isRunning: false, lastTick: null };
  } catch {
    return {
      mode: "work",
      secondsLeft: defaultDurations.work,
      isRunning: false,
      workDuration: defaultDurations.work,
      shortBreakDuration: defaultDurations.short_break,
      longBreakDuration: defaultDurations.long_break,
      completedWorkSessions: 0,
      tasks: [],
      activeTaskId: null,
      sessions: [],
      lastTick: null
    };
  }
};

export const usePomodoroStore = create<PomodoroState & PomodoroActions>()(
  (set, get) => {
    const persist = (next: PomodoroState) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    };

    return {
      ...loadInitialState(),

      setMode: (mode: Mode) =>
        set((state) => {
          const secondsLeft =
            mode === "work"
              ? state.workDuration
              : mode === "short_break"
              ? state.shortBreakDuration
              : state.longBreakDuration;
          const next = {
            ...state,
            mode,
            secondsLeft,
            isRunning: false,
            lastTick: null
          };
          persist(next);
          return next;
        }),

      start: () =>
        set((state) => {
          if (state.isRunning) return state;
          const next = { ...state, isRunning: true, lastTick: Date.now() };
          persist(next);
          return next;
        }),

      pause: () =>
        set((state) => {
          if (!state.isRunning) return state;
          const next = { ...state, isRunning: false, lastTick: null };
          persist(next);
          return next;
        }),

      reset: () =>
        set((state) => {
          const base =
            state.mode === "work"
              ? state.workDuration
              : state.mode === "short_break"
              ? state.shortBreakDuration
              : state.longBreakDuration;
          const next = {
            ...state,
            secondsLeft: base,
            isRunning: false,
            lastTick: null
          };
          persist(next);
          return next;
        }),

      tick: () =>
        set((state) => {
          if (!state.isRunning) return state;
          const now = Date.now();
          const lastTick = state.lastTick ?? now;
          const diffSeconds = Math.floor((now - lastTick) / 1000);
          if (diffSeconds <= 0) {
            return { ...state, lastTick: now };
          }

          let secondsLeft = state.secondsLeft - diffSeconds;
          let mode = state.mode;
          let completedWorkSessions = state.completedWorkSessions;
          const sessions = [...state.sessions];

          if (secondsLeft <= 0) {
            const endTime = new Date().toISOString();
            const durationMinutes = Math.round(
              (state.mode === "work"
                ? state.workDuration
                : state.mode === "short_break"
                ? state.shortBreakDuration
                : state.longBreakDuration) / 60
            );

            sessions.push({
              id: crypto.randomUUID(),
              taskId: state.activeTaskId,
              startTime: new Date(
                Date.now() - durationMinutes * 60 * 1000
              ).toISOString(),
              endTime,
              duration: durationMinutes,
              type: state.mode === "work" ? "work" : "break"
            });

            if (state.mode === "work") {
              completedWorkSessions += 1;
              const isLongBreak = completedWorkSessions % 4 === 0;
              mode = isLongBreak ? "long_break" : "short_break";
              secondsLeft = isLongBreak
                ? state.longBreakDuration
                : state.shortBreakDuration;
            } else {
              mode = "work";
              secondsLeft = state.workDuration;
            }
          }

          const next: PomodoroState = {
            ...state,
            secondsLeft,
            mode,
            completedWorkSessions,
            sessions,
            lastTick: now
          };
          persist(next);
          return next;
        }),

      addTask: (name: string, category?: string) =>
        set((state) => {
          const task: Task = {
            id: crypto.randomUUID(),
            name,
            category,
            createdAt: new Date().toISOString()
          };
          const tasks = [task, ...state.tasks];
          const next: PomodoroState = {
            ...state,
            tasks,
            activeTaskId: state.activeTaskId ?? task.id
          };
          persist(next);
          return next;
        }),

      setActiveTask: (taskId: string) =>
        set((state) => {
          const next: PomodoroState = { ...state, activeTaskId: taskId };
          persist(next);
          return next;
        })
    };
  }
);

export const selectTodayStats = (state: PomodoroState) => {
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = state.sessions.filter((s) =>
    s.startTime.startsWith(today)
  );
  const totalWorkMinutes = todaySessions
    .filter((s) => s.type === "work")
    .reduce((sum, s) => sum + s.duration, 0);
  const pomodoroCount = todaySessions.filter((s) => s.type === "work").length;

  const perTask = new Map<
    string,
    { taskId: string; taskName: string; totalMinutes: number; pomodoros: number }
  >();

  for (const s of todaySessions) {
    if (!s.taskId) continue;
    const task = state.tasks.find((t) => t.id === s.taskId);
    const key = s.taskId;
    const entry =
      perTask.get(key) ??
      {
        taskId: key,
        taskName: task?.name ?? "Untitled",
        totalMinutes: 0,
        pomodoros: 0
      };
    entry.totalMinutes += s.duration;
    if (s.type === "work") entry.pomodoros += 1;
    perTask.set(key, entry);
  }

  return {
    totalWorkMinutes,
    pomodoroCount,
    perTask: Array.from(perTask.values())
  };
};


