import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import type { Project, RowHistoryEntry, SessionRecord } from "../../db/types";
import { averageCompletionDays, projectComparison, staleProjects } from "../../db/statsUtils";

export default function ProjectsSection({
  projects,
  sessions,
  rowHistory,
}: {
  projects: Project[];
  sessions: SessionRecord[];
  rowHistory: RowHistoryEntry[];
}) {
  const avgCompletion = useMemo(() => averageCompletionDays(projects), [projects]);
  const comparison = useMemo(() => projectComparison(projects, sessions), [projects, sessions]);
  const stale = useMemo(
    () => staleProjects(projects, rowHistory, sessions).filter((p) => p.daysSince >= 7).slice(0, 5),
    [projects, rowHistory, sessions],
  );

  return (
    <section className="card p-4">
      <p className="section-title text-lg mb-3">Проекты</p>

      <div className="rounded-xl bg-cream-100/70 p-3 mb-4">
        <p className="text-xs text-ink-500">Среднее время до завершения проекта</p>
        <p className="text-lg text-ink-900 font-semibold mt-0.5">
          {avgCompletion !== null ? `≈ ${Math.round(avgCompletion)} дней` : "пока нет завершённых проектов"}
        </p>
      </div>

      {comparison.length > 0 && (
        <div className="mb-4 -mx-1 overflow-x-auto">
          <table className="w-full text-sm min-w-[380px]">
            <thead>
              <tr className="text-left text-ink-500 text-xs">
                <th className="font-medium pb-2 px-1">Проект</th>
                <th className="font-medium pb-2 px-1 text-right">Рядов</th>
                <th className="font-medium pb-2 px-1 text-right">Часов</th>
                <th className="font-medium pb-2 px-1 text-right">Р/ч</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.projectId} className="border-t border-cream-200">
                  <td className="py-2 px-1 text-ink-900 truncate max-w-[140px]">{row.name}</td>
                  <td className="py-2 px-1 text-right text-ink-700">{row.rows}</td>
                  <td className="py-2 px-1 text-right text-ink-700">
                    {row.hours > 0 ? row.hours.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 px-1 text-right text-ink-700">{row.rowsPerHour ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <p className="text-xs text-ink-500 mb-2">Незавершёнка — давно не трогали</p>
        {stale.length === 0 ? (
          <p className="text-sm text-ink-500">Все активные проекты в работе недавно — отлично!</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {stale.map((p) => (
              <div
                key={p.projectId}
                className="flex items-center justify-between text-sm rounded-lg bg-burgundy-50 px-2.5 py-2"
              >
                <span className="text-ink-900 truncate">{p.name}</span>
                <span className="text-burgundy-500 text-xs flex items-center gap-1 shrink-0 ml-2">
                  <TriangleAlert size={12} /> {p.daysSince} дн. без активности
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
