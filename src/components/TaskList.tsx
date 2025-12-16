import { FormEvent, useState } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";

export const TaskList = () => {
  const tasks = usePomodoroStore((s) => s.tasks);
  const activeTaskId = usePomodoroStore((s) => s.activeTaskId);
  const addTask = usePomodoroStore((s) => s.addTask);
  const setActiveTask = usePomodoroStore((s) => s.setActiveTask);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addTask(trimmed, category.trim() || undefined);
    setName("");
    setCategory("");
  };

  return (
    <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.8)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Tasks</h2>
          <p className="text-[11px] text-slate-500">
            Create a list of focus tasks and tap one to link it to the timer.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-2xl bg-slate-950/80 p-3 text-xs md:flex-row"
      >
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
          placeholder="Task name (e.g. Write portfolio section)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button
          type="submit"
          className="mt-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-emerald-400 md:mt-0"
        >
          Add
        </button>
      </form>

      <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            No tasks yet. Add your first focus task to start tracking what you
            actually worked on.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {tasks.map((task) => {
              const isActive = task.id === activeTaskId;
              return (
                <li
                  key={task.id}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 transition ${
                    isActive
                      ? "border-emerald-400/90 bg-emerald-500/10 shadow-sm"
                      : "border-slate-800/80 bg-slate-900/80 hover:border-slate-600"
                  }`}
                  onClick={() => setActiveTask(task.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-100">
                      {task.name}
                    </span>
                    {task.category ? (
                      <span className="mt-0.5 inline-flex w-fit rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {task.category}
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-flex w-fit rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-500">
                        No category
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isActive ? "Active" : "Tap to focus"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};



