import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RowHistoryEntry, SessionRecord } from "../../db/types";
import ActivityHeatmap from "../ActivityHeatmap";
import {
  averageSessionLength,
  mostProductiveWeekday,
  timeOfDayHistogram,
  weekdayBreakdown,
} from "../../db/statsUtils";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} сек`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} мин`;
  return `${(minutes / 60).toFixed(1)} ч`;
}

function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export default function ActivitySection({
  rowHistory,
  sessions,
}: {
  rowHistory: RowHistoryEntry[];
  sessions: SessionRecord[];
}) {
  const heatmapCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of rowHistory) {
      if (entry.action !== "increment") continue;
      const key = dayKey(entry.timestamp);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [rowHistory]);

  const productiveDay = useMemo(() => mostProductiveWeekday(rowHistory), [rowHistory]);
  const weekdayData = useMemo(() => weekdayBreakdown(rowHistory), [rowHistory]);
  const avgSession = useMemo(() => averageSessionLength(sessions), [sessions]);
  const hourData = useMemo(() => timeOfDayHistogram(sessions), [sessions]);
  const hasSessionHours = sessions.length > 0;

  return (
    <section className="card p-4">
      <p className="section-title text-lg mb-3">Паттерны активности</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-cream-100/70 p-3">
          <p className="text-xs text-ink-500">Самый продуктивный день</p>
          <p className="text-base text-ink-900 font-semibold capitalize mt-0.5">
            {productiveDay ? productiveDay.label : "пока нет данных"}
          </p>
        </div>
        <div className="rounded-xl bg-cream-100/70 p-3">
          <p className="text-xs text-ink-500">Средняя сессия</p>
          <p className="text-base text-ink-900 font-semibold mt-0.5">
            {avgSession > 0 ? formatDuration(avgSession) : "пока нет данных"}
          </p>
        </div>
      </div>

      <p className="text-xs text-ink-500 mb-2">Рядов по дням недели</p>
      <div style={{ width: "100%", height: 130 }} className="mb-4">
        <ResponsiveContainer>
          <BarChart data={weekdayData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e6d3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#5c4a3f" }} axisLine={{ stroke: "#e9d3b3" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#5c4a3f" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              cursor={{ fill: "#f3e6d3" }}
              contentStyle={{ borderRadius: 10, border: "1px solid #e9d3b3", fontSize: 12 }}
              formatter={(value: number) => [`${value} рядов`, ""]}
            />
            <Bar dataKey="rows" fill="#8fa96f" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-ink-500 mb-2">Любимое время суток для вязания</p>
      {hasSessionHours ? (
        <div style={{ width: "100%", height: 130 }} className="mb-4">
          <ResponsiveContainer>
            <BarChart data={hourData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e6d3" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}`}
                interval={2}
                tick={{ fontSize: 9, fill: "#5c4a3f" }}
                axisLine={{ stroke: "#e9d3b3" }}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#5c4a3f" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                cursor={{ fill: "#f3e6d3" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #e9d3b3", fontSize: 12 }}
                labelFormatter={(h) => `${h}:00`}
                formatter={(value: number) => [`${value} сессий`, ""]}
              />
              <Bar dataKey="count" fill="#c17a5c" radius={[4, 4, 0, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-ink-500 mb-4">
          Запускайте таймер сессии — тогда здесь появится распределение по времени суток.
        </p>
      )}

      <p className="text-xs text-ink-500 mb-2">Календарь активности</p>
      <ActivityHeatmap counts={heatmapCounts} />
    </section>
  );
}
