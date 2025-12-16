import { useState } from "react";
import { Layout } from "../components/Layout";
import { Timer } from "../components/Timer";
import { TaskList } from "../components/TaskList";
import { Stats } from "../components/Stats";

export const Home = () => {
  const [showTasks, setShowTasks] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Main Timer - Always Visible */}
        <div className="mb-12">
          <Timer />
        </div>

        {/* Toggle Buttons - Minimal */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`px-6 py-2.5 rounded-full text-sm font-light transition-all backdrop-blur-sm ${
              showTasks
                ? "bg-white/25 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {showTasks ? "Hide Tasks" : "Tasks"}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-6 py-2.5 rounded-full text-sm font-light transition-all backdrop-blur-sm ${
              showStats
                ? "bg-white/25 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {showStats ? "Hide Stats" : "Stats"}
          </button>
        </div>

        {/* Tasks Section */}
        {showTasks && (
          <div className="mb-8 animate-fade-in">
            <TaskList />
          </div>
        )}

        {/* Stats Section */}
        {showStats && (
          <div className="mb-8 animate-fade-in">
            <Stats />
          </div>
        )}
      </div>
    </Layout>
  );
};



