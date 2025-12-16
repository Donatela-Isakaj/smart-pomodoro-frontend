import { usePomodoroStore, selectTodayStats } from "../store/pomodoroStore";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ReportModal = ({ isOpen, onClose }: Props) => {
  const state = usePomodoroStore((s) => s);
  const today = selectTodayStats(state);

  // Calculate all-time stats
  const allTimeWorkMinutes = state.sessions
    .filter((s) => s.type === "work")
    .reduce((sum, s) => sum + s.duration, 0);
  const allTimePomodoros = state.sessions.filter((s) => s.type === "work").length;
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => {
    const taskSessions = state.sessions.filter((s) => s.taskId === t.id && s.type === "work");
    return taskSessions.length > 0;
  }).length;

  // Weekly stats (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().slice(0, 10);
  }).reverse();

  const weeklyData = last7Days.map((date) => {
    const daySessions = state.sessions.filter((s) => s.startTime.startsWith(date));
    const workMinutes = daySessions
      .filter((s) => s.type === "work")
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      minutes: workMinutes
    };
  });

  const barData = today.perTask.map((t) => ({
    name: t.taskName,
    minutes: t.totalMinutes
  }));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-black/30 backdrop-blur-md p-8 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Report</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">Today's Focus</p>
            <p className="text-2xl font-bold text-white">{today.totalWorkMinutes} min</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">Today's Pomodoros</p>
            <p className="text-2xl font-bold text-white">{today.pomodoroCount}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">All-Time Focus</p>
            <p className="text-2xl font-bold text-white">{allTimeWorkMinutes} min</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">All-Time Pomodoros</p>
            <p className="text-2xl font-bold text-white">{allTimePomodoros}</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mb-6 rounded-xl bg-white/10 p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Last 7 Days</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" stroke="#ffffff80" fontSize={12} />
                <YAxis stroke="#ffffff80" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="minutes" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Breakdown */}
        {barData.length > 0 && (
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Task Breakdown (Today)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} />
                  <YAxis stroke="#ffffff80" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="minutes" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">Total Tasks</p>
            <p className="text-xl font-bold text-white">{totalTasks}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 border border-white/20">
            <p className="text-sm text-white/70 mb-1">Completed Tasks</p>
            <p className="text-xl font-bold text-white">{completedTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

