import { FormEvent, useState } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

export const TaskList = () => {
  const tasks = usePomodoroStore((s) => s.tasks);
  const activeTaskId = usePomodoroStore((s) => s.activeTaskId);
  const addTask = usePomodoroStore((s) => s.addTask);
  const setActiveTask = usePomodoroStore((s) => s.setActiveTask);
  const removeTask = usePomodoroStore((s) => s.removeTask);

  const [name, setName] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setName("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/10 backdrop-blur-md p-8 shadow-2xl border border-white/20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-light text-white">Tasks</h2>
        <p className="text-sm text-white/60 mt-1">What are you working on?</p>
      </div>

      {/* Add Task Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
            placeholder="Add a new task..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = name.trim();
                if (trimmed) {
                  addTask(trimmed);
                  setName("");
                }
              }
            }}
          />
          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-light transition-all backdrop-blur-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-white/60 mb-2">You've finished all your tasks for today</p>
            <span className="text-2xl">🎉</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => {
              const isActive = task.id === activeTaskId;
              return (
                <li
                  key={task.id}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer backdrop-blur-sm ${
                    isActive
                      ? "bg-white/20 border border-white/30"
                      : "bg-white/5 hover:bg-white/10 border border-transparent"
                  }`}
                  onClick={() => setActiveTask(task.id)}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isActive
                      ? "border-white bg-white/30"
                      : "border-white/40"
                  }`}>
                    {isActive && (
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block truncate ${
                      isActive ? "text-white font-light" : "text-white/70"
                    }`}>
                      {task.name}
                    </span>
                    {task.category && (
                      <span className="text-xs text-white/50 mt-0.5 block">
                        {task.category}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-full p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Remove task"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
