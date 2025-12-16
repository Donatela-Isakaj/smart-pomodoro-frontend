import { Layout } from "../components/Layout";
import { Timer } from "../components/Timer";
import { TaskList } from "../components/TaskList";
import { Stats } from "../components/Stats";

export const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="flex-1 space-y-4">
          <Timer />
        </section>
        <section className="flex-1 space-y-4">
          <TaskList />
          <Stats />
        </section>
      </div>
    </Layout>
  );
};



