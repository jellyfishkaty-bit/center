import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Project, SessionRecord } from "../../db/types";
import { speedByProject, speedTrend } from "../../db/statsUtils";

export default function SpeedSection({
  sessions,
  projects,
}: {
  sessions: SessionRecord[];
  projects: Project[];
}) {
  const speeds = useMemo(() => speedByProject(sessions, projects), [sessions, projects]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const activeId = selectedId ?? speeds[0]?.projectId ?? null;
  const trend = useMemo(
    () => (activeId ? speedTrend(sessions, activeId) : []),
    [sessions, activeId],
  );

  if (speeds.length === 0) {
    return (
      <section className="card p-4">
        <p className="section-title text-lg mb-1">Скорость вязания</p>
        <p className="text-sm text-ink-500">
          Запустите таймер во время вязания — тогда здесь появится скорость в рядах в час.
        </p>
      </section>
    );
  }

  const chartData = speeds.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name,
    rowsPerHour: Math.round(s.rowsPerHour * 10) / 10,
  }));

  return (
    <section className="card p-4">
      <p className="section-title text-lg mb-3">Скорость вязания</p>

      <p className="text-xs text-ink-500 mb-2">Рядов в час по проектам</p>
      <div style={{ width: "100%", height: Math.max(140, speeds.length * 34) }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e6d3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#5c4a3f" }} axisLine={{ stroke: "#e9d3b3" }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 11, fill: "#3a2e26" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f3e6d3" }}
              contentStyle={{ borderRadius: 10, border: "1px solid #e9d3b3", fontSize: 12 }}
              formatter={(value: number) => [`${value} р/ч`, ""]}
            />
            <Bar dataKey="rowsPerHour" fill="#c17a5c" radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {speeds.length > 1 && (
        <select
          className="text-sm border border-cream-300 rounded-lg px-2 py-1.5 bg-white mt-4 w-full"
          value={activeId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {speeds.map((s) => (
            <option key={s.projectId} value={s.projectId}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {trend.length >= 2 ? (
        <>
          <p className="text-xs text-ink-500 mt-4 mb-2">Изменение скорости по сессиям</p>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e6d3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#5c4a3f" }} axisLine={{ stroke: "#e9d3b3" }} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#5c4a3f" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e9d3b3", fontSize: 12 }}
                  formatter={(value: number) => [value !== null ? `${value} р/ч` : "—", ""]}
                />
                <Line
                  type="monotone"
                  dataKey="rowsPerHour"
                  stroke="#758f56"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#758f56" }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-xs text-ink-500 mt-4">
          Для графика тренда скорости нужно хотя бы две сессии с таймером по этому проекту.
        </p>
      )}
    </section>
  );
}
