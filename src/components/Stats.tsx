import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell
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

  // Ring chart data for pomodoro progress (target: 8 pomodoros)
  const targetPomodoros = 8;
  const pomodoroProgress = Math.min((today.pomodoroCount / targetPomodoros) * 100, 100);
  const pieData = [
    { name: "Completed", value: today.pomodoroCount },
    { name: "Remaining", value: Math.max(0, targetPomodoros - today.pomodoroCount) }
  ];

  const COLORS = ["#ffffff", "rgba(255,255,255,0.2)"];

  return (
    <div className="space-y-4 rounded-3xl bg-white/10 backdrop-blur-md p-6 shadow-2xl border border-white/20 mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-light text-white">
            Today&apos;s Focus
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Your productivity today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-white/80">
            <div className="mb-1">
              <span className="font-light text-2xl text-white">
                {today.totalWorkMinutes}
              </span>
              <span className="text-sm ml-1">min</span>
            </div>
            <div className="text-xs">{today.pomodoroCount} pomodoros</div>
          </div>
          {/* Ring chart for pomodoro progress */}
          <div className="relative h-20 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={36}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-light text-white leading-none">{today.pomodoroCount}</div>
                <div className="text-xs text-white/50 leading-tight mt-0.5">/{targetPomodoros}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Minutes per task card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="mb-3">
            <p className="text-sm font-light text-white/80">Minutes per task</p>
          </div>
          <div className="h-40">
            {barData.length === 0 ? (
              <div className="flex h-full items-center justify-center px-2">
                <p className="text-sm text-white/50 text-center leading-relaxed">
                  Complete a pomodoro to see breakdown by task.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="minutes" fill="rgba(255, 255, 255, 0.8)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily focus card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="mb-3">
            <p className="text-sm font-light text-white/80">Daily focus</p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: 12
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "rgba(255, 255, 255, 0.8)", strokeWidth: 2, stroke: "rgba(0, 0, 0, 0.2)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


