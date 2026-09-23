import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "../db/db";
import StatTile from "../components/stats/StatTile";
import SpeedSection from "../components/stats/SpeedSection";
import ActivitySection from "../components/stats/ActivitySection";
import YarnSection from "../components/stats/YarnSection";
import ProjectsSection from "../components/stats/ProjectsSection";
import AchievementsSection from "../components/stats/AchievementsSection";
import SectionDivider from "../components/decor/SectionDivider";

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)} мин`;
  return `${hours.toFixed(1)} ч`;
}

function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export default function StatisticsPage() {
  const projects = useLiveQuery(() => db.projects.toArray(), []);
  const allHistory = useLiveQuery(() => db.rowHistory.toArray(), []);
  const allSessions = useLiveQuery(() => db.sessions.toArray(), []);
  const allYarns = useLiveQuery(() => db.yarns.toArray(), []);

  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");

  const completedCount = projects?.filter((p) => p.status === "completed").length ?? 0;
  const totalRows = projects?.reduce((sum, p) => sum + p.currentRow, 0) ?? 0;
  const totalSeconds = allSessions?.reduce((sum, s) => sum + s.durationSeconds, 0) ?? 0;

  const chartData = useMemo(() => {
    if (!allHistory) return [];
    const relevant =
      selectedProjectId === "all"
        ? allHistory
        : allHistory.filter((h) => h.projectId === selectedProjectId);

    const counts = new Map<string, number>();
    for (const entry of relevant) {
      if (entry.action !== "increment") continue;
      const key = dayKey(entry.timestamp);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { date: string; rows: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        rows: counts.get(key) ?? 0,
      });
    }
    return days;
  }, [allHistory, selectedProjectId]);

  const loading = !projects || !allHistory || !allSessions || !allYarns;

  return (
    <div className="flex flex-col gap-5 pb-4">
      <h1 className="text-3xl">Статистика</h1>

      <div className="grid grid-cols-3 gap-2">
        <StatTile value={completedCount} label="завершено проектов" />
        <StatTile value={totalRows} label="рядов всего" accent="sage" />
        <StatTile value={formatHours(totalSeconds)} label="времени вязания" accent="mustard" />
      </div>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title text-lg">Рядов в день (14 дней)</p>
          <select
            className="text-sm border border-cream-300 rounded-lg px-2 py-1 bg-white"
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value === "all" ? "all" : Number(e.target.value))
            }
          >
            <option value="all">Все проекты</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e6d3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#5c4a3f" }}
                axisLine={{ stroke: "#e9d3b3" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#5c4a3f" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "#f3e6d3" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e9d3b3",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value} рядов`, ""]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="rows" fill="#c17a5c" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {loading ? (
        <p className="text-center text-ink-500 mt-6">Загрузка...</p>
      ) : (
        <>
          <SectionDivider label="скорость" />
          <SpeedSection sessions={allSessions} projects={projects} />

          <SectionDivider label="активность" />
          <ActivitySection rowHistory={allHistory} sessions={allSessions} />

          <SectionDivider label="пряжа" />
          <YarnSection yarns={allYarns} projects={projects} />

          <SectionDivider label="проекты" />
          <ProjectsSection projects={projects} sessions={allSessions} rowHistory={allHistory} />

          <SectionDivider label="достижения" />
          <AchievementsSection
            projects={projects}
            sessions={allSessions}
            rowHistory={allHistory}
            totalRows={totalRows}
            totalSeconds={totalSeconds}
          />
        </>
      )}
    </div>
  );
}
