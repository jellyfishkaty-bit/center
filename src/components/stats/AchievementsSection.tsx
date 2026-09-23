import { useMemo } from "react";
import { Flame, Rows3, Timer, Trophy } from "lucide-react";
import type { Project, RowHistoryEntry, SessionRecord } from "../../db/types";
import { currentStreak, longestProjectByRows, longestProjectByTime } from "../../db/statsUtils";

function formatHoursAsDays(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  const days = totalSeconds / 86400;
  if (days >= 1) {
    return `${hours.toFixed(0)} ч — это как ${days.toFixed(1)} полных суток за вязанием`;
  }
  return `${hours.toFixed(1)} ч`;
}

export default function AchievementsSection({
  projects,
  sessions,
  rowHistory,
  totalRows,
  totalSeconds,
}: {
  projects: Project[];
  sessions: SessionRecord[];
  rowHistory: RowHistoryEntry[];
  totalRows: number;
  totalSeconds: number;
}) {
  const streak = useMemo(() => currentStreak(rowHistory), [rowHistory]);
  const byTime = useMemo(() => longestProjectByTime(sessions, projects), [sessions, projects]);
  const byRows = useMemo(() => longestProjectByRows(projects), [projects]);

  return (
    <section className="card p-4">
      <p className="section-title text-lg mb-3">Достижения</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl bg-mustard-100/60 p-3">
          <div className="flex items-center gap-1.5 text-mustard-700 mb-1">
            <Rows3 size={15} />
            <span className="text-xs font-medium">Рядов провязано</span>
          </div>
          <p className="text-xl text-ink-900 section-title">{totalRows}</p>
        </div>
        <div className="rounded-xl bg-mustard-100/60 p-3">
          <div className="flex items-center gap-1.5 text-mustard-700 mb-1">
            <Flame size={15} />
            <span className="text-xs font-medium">Текущий стрик</span>
          </div>
          <p className="text-xl text-ink-900 section-title">
            {streak > 0 ? `${streak} дн.` : "0"}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-mustard-100/60 p-3 mb-3">
        <div className="flex items-center gap-1.5 text-mustard-700 mb-1">
          <Timer size={15} />
          <span className="text-xs font-medium">Время за вязанием</span>
        </div>
        <p className="text-base text-ink-900 font-medium">
          {totalSeconds > 0 ? formatHoursAsDays(totalSeconds) : "Пока нет завершённых сессий"}
        </p>
      </div>

      <div className="rounded-xl bg-mustard-100/60 p-3">
        <div className="flex items-center gap-1.5 text-mustard-700 mb-1.5">
          <Trophy size={15} />
          <span className="text-xs font-medium">Самый длинный проект</span>
        </div>
        <div className="text-sm text-ink-700 flex flex-col gap-1">
          <p>
            По времени:{" "}
            <span className="font-medium text-ink-900">
              {byTime ? `${byTime.name} (${byTime.hours.toFixed(1)} ч)` : "пока нет данных"}
            </span>
          </p>
          <p>
            По рядам:{" "}
            <span className="font-medium text-ink-900">
              {byRows ? `${byRows.name} (${byRows.rows} рядов)` : "пока нет данных"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
