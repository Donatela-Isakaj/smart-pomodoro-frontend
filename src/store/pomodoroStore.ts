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
  taskWorkTimes: Record<string, number>; // Each task's saved work time (in seconds)
  taskIsRunning: Record<string, boolean>; // Each task's running state
  taskBreakTime: Record<string, number | null>; // Each task's saved work time when break started
  taskBreakTimes: Record<string, number>; // Each task's saved break time (in seconds)
  taskBreakIsRunning: Record<string, boolean>; // Each task's break timer running state
};

type PomodoroActions = {
  setMode: (mode: Mode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  addTask: (name: string, category?: string) => void;
  setActiveTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  setDurations: (work: number, shortBreak: number, longBreak: number) => void;
};

const STORAGE_KEY = "smart-pomodoro-state-v1";

const defaultDurations = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const loadInitialState = (): PomodoroState => {
  const baseState = {
    mode: "work" as Mode,
    secondsLeft: defaultDurations.work,
    isRunning: false,
    workDuration: defaultDurations.work,
    shortBreakDuration: defaultDurations.short_break,
    longBreakDuration: defaultDurations.long_break,
    completedWorkSessions: 0,
    tasks: [],
    activeTaskId: null,
    sessions: [],
    lastTick: null,
    taskWorkTimes: {} as Record<string, number>,
    taskIsRunning: {} as Record<string, boolean>,
    taskBreakTime: {} as Record<string, number | null>,
    taskBreakTimes: {} as Record<string, number>,
    taskBreakIsRunning: {} as Record<string, boolean>,
  };

  if (typeof window === "undefined") {
    return baseState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return baseState;
    }
    const parsed = JSON.parse(raw) as PomodoroState;
    return {
      ...parsed,
      isRunning: false,
      lastTick: null,
      taskWorkTimes: parsed.taskWorkTimes || {},
      taskIsRunning: parsed.taskIsRunning || {},
      taskBreakTime: parsed.taskBreakTime || {},
      taskBreakTimes: parsed.taskBreakTimes || {},
      taskBreakIsRunning: parsed.taskBreakIsRunning || {},
    };
  } catch {
    return baseState;
  }
};

export const usePomodoroStore = create<PomodoroState & PomodoroActions>()((
  set,
  get
) => {
  const persist = (next: PomodoroState) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  return {
    ...loadInitialState(),

    setMode: (mode: Mode) =>
      set((state) => {
        let secondsLeft: number;
        let isRunning: boolean;
        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let taskBreakTime = { ...state.taskBreakTime };
        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };

        if (mode === "work") {
          // Switching back to work mode - restore active task's timer
          if (state.activeTaskId) {
            // Save break timer state before switching (only if break was actually started/running)
            if (state.mode !== "work") {
              const breakWasRunning =
                taskBreakIsRunning[state.activeTaskId] ||
                (state.isRunning && !taskIsRunning[state.activeTaskId]);

              if (breakWasRunning) {
                // Break timer was running - preserve its state
                taskBreakTimes[state.activeTaskId] = state.secondsLeft;
                taskBreakIsRunning[state.activeTaskId] = true;
              } else {
                // Break timer was not running - can reset it
                const breakMode =
                  state.mode === "long_break" ? "long_break" : "short_break";
                taskBreakTimes[state.activeTaskId] =
                  breakMode === "long_break"
                    ? state.longBreakDuration
                    : state.shortBreakDuration;
                taskBreakIsRunning[state.activeTaskId] = false;
              }
            }

            // Restore from break if available
            if (
              taskBreakTime[state.activeTaskId] !== null &&
              taskBreakTime[state.activeTaskId] !== undefined
            ) {
              secondsLeft = taskBreakTime[state.activeTaskId]!;
              taskWorkTimes[state.activeTaskId] = secondsLeft;
              taskBreakTime[state.activeTaskId] = null; // Clear break time
            } else if (taskWorkTimes[state.activeTaskId] !== undefined) {
              // Restore task's saved work time
              secondsLeft = taskWorkTimes[state.activeTaskId];
            } else {
              // First time - use full duration
              secondsLeft = state.workDuration;
              taskWorkTimes[state.activeTaskId] = state.workDuration;
            }
            // Keep task timer running if it was running (preserve running state)
            // Timer continues running when switching modes
            isRunning = taskIsRunning[state.activeTaskId] || false;
          } else {
            secondsLeft = state.workDuration;
            isRunning = false;
          }
        } else {
          // Switching to break mode
          // Check if break timer was actually started (running) before switching to work
          const breakWasRunning =
            state.activeTaskId && taskBreakIsRunning[state.activeTaskId];

          if (
            state.activeTaskId &&
            breakWasRunning &&
            taskBreakTimes[state.activeTaskId] !== undefined
          ) {
            // Break timer was running before - restore its saved state
            secondsLeft = taskBreakTimes[state.activeTaskId];
            // Restore break timer running state (it was paused when switching to work)
            isRunning = false; // Break timer not running yet (needs Start click)
          } else {
            // Break timer was not running or never started - reset to full duration
            secondsLeft =
              mode === "short_break"
                ? state.shortBreakDuration
                : state.longBreakDuration;
            if (state.activeTaskId) {
              taskBreakTimes[state.activeTaskId] = secondsLeft;
              taskBreakIsRunning[state.activeTaskId] = false;
            }
            isRunning = false;
          }

          // Keep task timer running if it was running (it will stop when break starts)
          // If task timer is running, keep isRunning true so tick() continues to update it
          if (state.activeTaskId && taskIsRunning[state.activeTaskId]) {
            isRunning = true; // Keep running so task timer continues to tick
          }
          // Task timer state is preserved in taskIsRunning - don't change it here
          // The task timer will continue running until start() is called
        }

        // Preserve lastTick if timer is running to ensure seamless continuation
        const lastTick = isRunning && state.lastTick ? state.lastTick : null;

        const next = {
          ...state,
          mode,
          secondsLeft,
          isRunning,
          lastTick,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTime,
          taskBreakTimes,
          taskBreakIsRunning,
        };
        persist(next);
        return next;
      }),

    start: () =>
      set((state) => {
        if (state.isRunning) return state;

        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let taskBreakTime = { ...state.taskBreakTime };
        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };
        let secondsLeft = state.secondsLeft;

        if (state.mode === "work") {
          // Starting work timer for active task
          if (state.activeTaskId) {
            taskIsRunning[state.activeTaskId] = true;
            // Use current secondsLeft (should already be set to task's time)
            taskWorkTimes[state.activeTaskId] = secondsLeft;

            // If break timer was running, stop it and reset it
            // This happens when user clicks Start in focus mode after break was running
            if (taskBreakIsRunning[state.activeTaskId]) {
              taskBreakIsRunning[state.activeTaskId] = false;
              // Reset break timer to full duration for next time
              const breakMode =
                state.completedWorkSessions % 4 === 0
                  ? "long_break"
                  : "short_break";
              taskBreakTimes[state.activeTaskId] =
                breakMode === "long_break"
                  ? state.longBreakDuration
                  : state.shortBreakDuration;
            }
          }
        } else {
          // Starting break - save current task's work time and stop it
          if (state.activeTaskId) {
            // Get the current task time (it was still running in background)
            const currentTaskTime =
              taskWorkTimes[state.activeTaskId] || state.workDuration;

            // If task timer was running, calculate elapsed time since last tick
            if (taskIsRunning[state.activeTaskId] && state.lastTick) {
              const elapsed = Math.floor((Date.now() - state.lastTick) / 1000);
              const updatedTime = Math.max(0, currentTaskTime - elapsed);
              taskWorkTimes[state.activeTaskId] = updatedTime;
              taskBreakTime[state.activeTaskId] = updatedTime;
            } else {
              taskBreakTime[state.activeTaskId] = currentTaskTime;
            }

            // Now stop the task timer - break is actually starting
            taskIsRunning[state.activeTaskId] = false;

            // Start break timer
            taskBreakIsRunning[state.activeTaskId] = true;
            taskBreakTimes[state.activeTaskId] = secondsLeft;
          }
        }

        const next = {
          ...state,
          isRunning: true,
          lastTick: Date.now(),
          taskWorkTimes,
          taskIsRunning,
          taskBreakTime,
          taskBreakTimes,
          taskBreakIsRunning,
          secondsLeft,
        };
        persist(next);
        return next;
      }),

    pause: () =>
      set((state) => {
        if (!state.isRunning) return state;

        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };

        if (state.mode === "work" && state.activeTaskId) {
          // Pause active task's timer
          taskIsRunning[state.activeTaskId] = false;
          taskWorkTimes[state.activeTaskId] = state.secondsLeft;
        } else if (
          (state.mode === "short_break" || state.mode === "long_break") &&
          state.activeTaskId
        ) {
          // Pause break timer
          taskBreakIsRunning[state.activeTaskId] = false;
          taskBreakTimes[state.activeTaskId] = state.secondsLeft;
        }

        const next = {
          ...state,
          isRunning: false,
          lastTick: null,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTimes,
          taskBreakIsRunning,
        };
        persist(next);
        return next;
      }),

    reset: () =>
      set((state) => {
        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let base: number;

        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };

        if (state.mode === "work") {
          base = state.workDuration;
          // Reset active task's work time
          if (state.activeTaskId) {
            taskWorkTimes[state.activeTaskId] = base;
            taskIsRunning[state.activeTaskId] = false;
          }
        } else {
          base =
            state.mode === "short_break"
              ? state.shortBreakDuration
              : state.longBreakDuration;
          // Reset active task's break time
          if (state.activeTaskId) {
            taskBreakTimes[state.activeTaskId] = base;
            taskBreakIsRunning[state.activeTaskId] = false;
          }
        }

        const next = {
          ...state,
          secondsLeft: base,
          isRunning: false,
          lastTick: null,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTimes,
          taskBreakIsRunning,
        };
        persist(next);
        return next;
      }),

    tick: () =>
      set((state) => {
        const now = Date.now();
        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let taskBreakTime = { ...state.taskBreakTime };
        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };

        // Update task timer if it's running (even if we're in break mode but break hasn't started)
        // Task timer continues running until break actually starts
        if (state.activeTaskId && taskIsRunning[state.activeTaskId]) {
          const lastTaskTick = state.lastTick ?? now;
          const taskDiffSeconds = Math.floor((now - lastTaskTick) / 1000);
          if (taskDiffSeconds > 0) {
            // Update task timer if we're in work mode, or in break mode but break hasn't started
            // Break has started if mode is break AND isRunning is true AND taskIsRunning is false
            const breakHasStarted =
              (state.mode === "short_break" || state.mode === "long_break") &&
              state.isRunning &&
              !taskIsRunning[state.activeTaskId];
            const shouldUpdateTaskTimer =
              state.mode === "work" ||
              ((state.mode === "short_break" || state.mode === "long_break") &&
                !breakHasStarted);

            if (shouldUpdateTaskTimer) {
              const currentTaskTime =
                taskWorkTimes[state.activeTaskId] || state.workDuration;
              const newTaskTime = Math.max(
                0,
                currentTaskTime - taskDiffSeconds
              );
              taskWorkTimes[state.activeTaskId] = newTaskTime;
            }
          }
        }

        // Update break/work timer if it's running
        // If task timer is running in break mode, we still need to update it, so don't return early
        const shouldUpdateBreakTimer =
          state.isRunning &&
          (state.mode === "work" ||
            ((state.mode === "short_break" || state.mode === "long_break") &&
              state.activeTaskId &&
              !taskIsRunning[state.activeTaskId]));

        if (
          !shouldUpdateBreakTimer &&
          !(state.activeTaskId && taskIsRunning[state.activeTaskId])
        ) {
          return {
            ...state,
            taskWorkTimes,
            taskIsRunning,
            taskBreakTime,
            taskBreakTimes,
            taskBreakIsRunning,
            lastTick: now,
          };
        }

        // Only update break/work timer if it should be running
        let secondsLeft = state.secondsLeft;
        let mode = state.mode;
        let completedWorkSessions = state.completedWorkSessions;
        const sessions = [...state.sessions];

        if (shouldUpdateBreakTimer) {
          const lastTick = state.lastTick ?? now;
          const diffSeconds = Math.floor((now - lastTick) / 1000);
          if (diffSeconds > 0) {
            secondsLeft = state.secondsLeft - diffSeconds;

            // Update task timer during work sessions
            if (
              state.mode === "work" &&
              state.activeTaskId &&
              taskIsRunning[state.activeTaskId]
            ) {
              taskWorkTimes[state.activeTaskId] = secondsLeft;
            }

            // Update break timer during break sessions
            if (
              (state.mode === "short_break" || state.mode === "long_break") &&
              state.activeTaskId &&
              taskBreakIsRunning[state.activeTaskId]
            ) {
              taskBreakTimes[state.activeTaskId] = secondsLeft;
            }
          } else {
            return {
              ...state,
              lastTick: now,
              taskWorkTimes,
              taskIsRunning,
              taskBreakTime,
              taskBreakTimes,
              taskBreakIsRunning,
            };
          }
        } else {
          // Task timer is running but break timer is not - just update lastTick
          return {
            ...state,
            lastTick: now,
            taskWorkTimes,
            taskIsRunning,
            taskBreakTime,
            taskBreakTimes,
            taskBreakIsRunning,
          };
        }

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
            type: state.mode === "work" ? "work" : "break",
          });

          if (state.mode === "work") {
            completedWorkSessions += 1;
            const isLongBreak = completedWorkSessions % 4 === 0;
            mode = isLongBreak ? "long_break" : "short_break";
            secondsLeft = isLongBreak
              ? state.longBreakDuration
              : state.shortBreakDuration;

            // Work session completed - reset task timer and start break
            let taskIsRunning = { ...state.taskIsRunning };
            let taskBreakTime = { ...state.taskBreakTime };
            let taskBreakTimes = { ...state.taskBreakTimes };
            let taskBreakIsRunning = { ...state.taskBreakIsRunning };

            if (state.activeTaskId) {
              // Reset task timer for next work session
              taskWorkTimes[state.activeTaskId] = state.workDuration;
              taskIsRunning[state.activeTaskId] = false; // Stop task timer
              taskBreakTime[state.activeTaskId] = state.workDuration; // Save for break restoration
              // Initialize break timer
              taskBreakTimes[state.activeTaskId] = secondsLeft;
              taskBreakIsRunning[state.activeTaskId] = true; // Break timer starts running
            }

            const breakState: PomodoroState = {
              ...state,
              secondsLeft,
              mode,
              completedWorkSessions,
              sessions,
              lastTick: now,
              isRunning: true, // Break timer starts running
              taskWorkTimes,
              taskIsRunning,
              taskBreakTime,
              taskBreakTimes,
              taskBreakIsRunning,
            };
            persist(breakState);
            return breakState;
          } else {
            // Break completed, return to work
            mode = "work";
            let taskWorkTimes = { ...state.taskWorkTimes };
            let taskIsRunning = { ...state.taskIsRunning };
            let taskBreakTime = { ...state.taskBreakTime };
            let taskBreakTimes = { ...state.taskBreakTimes };
            let taskBreakIsRunning = { ...state.taskBreakIsRunning };
            let isRunning: boolean;

            // Stop break timer
            if (state.activeTaskId) {
              taskBreakIsRunning[state.activeTaskId] = false;
            }

            // Restore saved work time for active task from break
            if (
              state.activeTaskId &&
              taskBreakTime[state.activeTaskId] !== null &&
              taskBreakTime[state.activeTaskId] !== undefined
            ) {
              secondsLeft = taskBreakTime[state.activeTaskId]!;
              taskWorkTimes[state.activeTaskId] = secondsLeft;
              taskBreakTime[state.activeTaskId] = null; // Clear break time
              // Restore task's running state
              isRunning = taskIsRunning[state.activeTaskId] || false;
            } else if (
              state.activeTaskId &&
              taskWorkTimes[state.activeTaskId]
            ) {
              secondsLeft = taskWorkTimes[state.activeTaskId];
              isRunning = taskIsRunning[state.activeTaskId] || false;
            } else {
              secondsLeft = state.workDuration;
              if (state.activeTaskId) {
                taskWorkTimes[state.activeTaskId] = state.workDuration;
                taskIsRunning[state.activeTaskId] = false;
              }
              isRunning = false;
            }

            const nextState: PomodoroState = {
              ...state,
              secondsLeft,
              mode,
              completedWorkSessions,
              sessions,
              lastTick: isRunning ? now : null,
              isRunning,
              taskWorkTimes,
              taskIsRunning,
              taskBreakTime,
              taskBreakTimes,
              taskBreakIsRunning,
            };
            persist(nextState);
            return nextState;
          }
        }

        const next: PomodoroState = {
          ...state,
          secondsLeft,
          mode,
          completedWorkSessions,
          sessions,
          lastTick: now,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTime,
          taskBreakTimes,
          taskBreakIsRunning,
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
          createdAt: new Date().toISOString(),
        };
        const tasks = [task, ...state.tasks];
        const next: PomodoroState = {
          ...state,
          tasks,
          activeTaskId: state.activeTaskId ?? task.id,
        };
        persist(next);
        return next;
      }),

    setActiveTask: (taskId: string) =>
      set((state) => {
        let taskWorkTimes = { ...state.taskWorkTimes };
        let taskIsRunning = { ...state.taskIsRunning };
        let taskBreakTime = { ...state.taskBreakTime };
        let taskBreakTimes = { ...state.taskBreakTimes };
        let taskBreakIsRunning = { ...state.taskBreakIsRunning };
        let secondsLeft = state.secondsLeft;
        let isRunning = state.isRunning;

        // Save current task's state if switching from another task
        if (state.activeTaskId && state.activeTaskId !== taskId) {
          // Save previous task's work time
          if (state.mode === "work") {
            taskWorkTimes[state.activeTaskId] = state.secondsLeft;
          } else {
            // Save break time
            taskBreakTimes[state.activeTaskId] = state.secondsLeft;
            taskBreakIsRunning[state.activeTaskId] =
              state.isRunning && !taskIsRunning[state.activeTaskId];
          }
          // Stop previous task's timer
          taskIsRunning[state.activeTaskId] = false;
        }

        // Load new task's state based on current mode
        if (state.mode === "work") {
          // Load task's work time
          if (taskWorkTimes[taskId] !== undefined) {
            secondsLeft = taskWorkTimes[taskId];
          } else {
            secondsLeft = state.workDuration;
            taskWorkTimes[taskId] = state.workDuration;
          }
          // Restore task's running state
          isRunning = taskIsRunning[taskId] || false;
        } else {
          // In break mode - restore break timer state
          if (taskBreakTimes[taskId] !== undefined) {
            secondsLeft = taskBreakTimes[taskId];
            isRunning = taskBreakIsRunning[taskId] || false;
          } else {
            secondsLeft =
              state.mode === "short_break"
                ? state.shortBreakDuration
                : state.longBreakDuration;
            taskBreakTimes[taskId] = secondsLeft;
            taskBreakIsRunning[taskId] = false;
            // If task timer is running, keep isRunning true so it continues
            isRunning = taskIsRunning[taskId] || false;
          }
        }

        const next: PomodoroState = {
          ...state,
          activeTaskId: taskId,
          secondsLeft,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTime,
          taskBreakTimes,
          taskBreakIsRunning,
          isRunning,
          lastTick: isRunning ? state.lastTick : null,
        };
        persist(next);
        return next;
      }),

    removeTask: (taskId: string) =>
      set((state) => {
        const tasks = state.tasks.filter((t) => t.id !== taskId);
        const activeTaskId =
          state.activeTaskId === taskId
            ? tasks.length > 0
              ? tasks[0].id
              : null
            : state.activeTaskId;

        // Clean up task timer data
        const taskWorkTimes = { ...state.taskWorkTimes };
        const taskIsRunning = { ...state.taskIsRunning };
        const taskBreakTime = { ...state.taskBreakTime };
        const taskBreakTimes = { ...state.taskBreakTimes };
        const taskBreakIsRunning = { ...state.taskBreakIsRunning };
        delete taskWorkTimes[taskId];
        delete taskIsRunning[taskId];
        delete taskBreakTime[taskId];
        delete taskBreakTimes[taskId];
        delete taskBreakIsRunning[taskId];

        // If we removed the active task, load the new active task's timer
        let secondsLeft = state.secondsLeft;
        let isRunning = state.isRunning;
        if (
          state.activeTaskId === taskId &&
          activeTaskId &&
          state.mode === "work"
        ) {
          secondsLeft = taskWorkTimes[activeTaskId] || state.workDuration;
          isRunning = taskIsRunning[activeTaskId] || false;
          if (!taskWorkTimes[activeTaskId]) {
            taskWorkTimes[activeTaskId] = state.workDuration;
          }
        }

        const next: PomodoroState = {
          ...state,
          tasks,
          activeTaskId,
          taskWorkTimes,
          taskIsRunning,
          taskBreakTime,
          taskBreakTimes,
          taskBreakIsRunning,
          secondsLeft,
          isRunning,
        };
        persist(next);
        return next;
      }),

    setDurations: (work: number, shortBreak: number, longBreak: number) =>
      set((state) => {
        // Ensure minimum 1 minute
        const workSec = Math.max(60, work * 60);
        const shortBreakSec = Math.max(60, shortBreak * 60);
        const longBreakSec = Math.max(60, longBreak * 60);

        // Update current secondsLeft if mode matches
        let secondsLeft = state.secondsLeft;
        if (state.mode === "work") {
          secondsLeft = workSec;
        } else if (state.mode === "short_break") {
          secondsLeft = shortBreakSec;
        } else if (state.mode === "long_break") {
          secondsLeft = longBreakSec;
        }

        const next: PomodoroState = {
          ...state,
          workDuration: workSec,
          shortBreakDuration: shortBreakSec,
          longBreakDuration: longBreakSec,
          secondsLeft,
          isRunning: false,
          lastTick: null,
        };
        persist(next);
        return next;
      }),
  };
});

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
    {
      taskId: string;
      taskName: string;
      totalMinutes: number;
      pomodoros: number;
    }
  >();

  for (const s of todaySessions) {
    if (!s.taskId) continue;
    const task = state.tasks.find((t) => t.id === s.taskId);
    const key = s.taskId;
    const entry = perTask.get(key) ?? {
      taskId: key,
      taskName: task?.name ?? "Untitled",
      totalMinutes: 0,
      pomodoros: 0,
    };
    entry.totalMinutes += s.duration;
    if (s.type === "work") entry.pomodoros += 1;
    perTask.set(key, entry);
  }

  return {
    totalWorkMinutes,
    pomodoroCount,
    perTask: Array.from(perTask.values()),
  };
};
