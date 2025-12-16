import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from "recharts";
import { usePomodoroStore, selectTodayStats } from "../store/pomodoroStore";

export const Stats = () => {
  const state = usePomodoroStore((s) => s);
  const today = selectTodayStats(state);

  const barData = today.perTask.map((t) => ({
    name: t.taskName,
    minutes: t.totalMinutes
  }));

  const lineData = [
    {
      label: "Today",
      minutes: today.totalWorkMinutes
    }
  ];

  return (
    <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.8)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Today&apos;s focus
          </h2>
          <p className="text-[11px] text-slate-500">
            How much deep work you&apos;ve done today.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <div>
            <span className="font-semibold text-emerald-400">
              {today.totalWorkMinutes} min
            </span>{" "}
            focus
          </div>
          <div>{today.pomodoroCount} pomodoro(s)</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-40 rounded-2xl bg-slate-950/80 p-2">
          <p className="mb-1 text-[11px] text-slate-400">Minutes per task</p>
          {barData.length === 0 ? (
            <p className="mt-5 text-[11px] text-slate-500">
              Complete a pomodoro to see breakdown by task.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    fontSize: 11
                  }}
                />
                <Bar dataKey="minutes" fill="#22c55e" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="h-40 rounded-2xl bg-slate-950/80 p-2">
          <p className="mb-1 text-[11px] text-slate-400">
            Daily focus (MVP preview)
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#1e293b",
                  fontSize: 11
                }}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


