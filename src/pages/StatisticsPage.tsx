import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "../db/db";
import ActivityHeatmap from "../components/ActivityHeatmap";

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

  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");

  const completedCount = projects?.filter((p) => p.status === "completed").length ?? 0;
  const totalRows = projects?.reduce((sum, p) => sum + p.currentRow, 0) ?? 0;
  const totalSeconds = allSessions?.reduce((sum, s) => sum + s.durationSeconds, 0) ?? 0;

  const heatmapCounts = useMemo(() => {
    const map = new Map<string, number>();
    if (!allHistory) return map;
    for (const entry of allHistory) {
      if (entry.action !== "increment") continue;
      const key = dayKey(entry.timestamp);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [allHistory]);

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

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-ink-900">Статистика</h1>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-terracotta-600">{completedCount}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">завершено проектов</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-terracotta-600">{totalRows}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">рядов всего</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-terracotta-600">{formatHours(totalSeconds)}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">времени вязания</p>
        </div>
      </div>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-ink-900">Рядов в день (14 дней)</p>
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

      <section className="card p-4">
        <p className="font-semibold text-ink-900 mb-3">Календарь активности</p>
        <ActivityHeatmap counts={heatmapCounts} />
      </section>
    </div>
  );
}
