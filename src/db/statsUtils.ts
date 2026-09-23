import type { Project, RowHistoryEntry, SessionRecord, Yarn } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export interface ProjectSpeed {
  projectId: number;
  name: string;
  totalRows: number;
  totalHours: number;
  rowsPerHour: number;
}

export function speedByProject(sessions: SessionRecord[], projects: Project[]): ProjectSpeed[] {
  const byProject = new Map<number, { rows: number; seconds: number }>();
  for (const s of sessions) {
    const rows = Math.max(0, s.rowsAtEnd - s.rowsAtStart);
    const entry = byProject.get(s.projectId) ?? { rows: 0, seconds: 0 };
    entry.rows += rows;
    entry.seconds += s.durationSeconds;
    byProject.set(s.projectId, entry);
  }
  const result: ProjectSpeed[] = [];
  for (const [projectId, { rows, seconds }] of byProject.entries()) {
    if (seconds <= 0) continue;
    const project = projects.find((p) => p.id === projectId);
    result.push({
      projectId,
      name: project?.name ?? "Проект удалён",
      totalRows: rows,
      totalHours: seconds / 3600,
      rowsPerHour: rows / (seconds / 3600),
    });
  }
  return result.sort((a, b) => b.rowsPerHour - a.rowsPerHour);
}

export interface SpeedPoint {
  index: number;
  date: string;
  rowsPerHour: number | null;
}

export function speedTrend(sessions: SessionRecord[], projectId: number): SpeedPoint[] {
  const projectSessions = sessions
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => a.startTime - b.startTime);
  return projectSessions.map((s, i) => {
    const rows = Math.max(0, s.rowsAtEnd - s.rowsAtStart);
    const hours = s.durationSeconds / 3600;
    return {
      index: i + 1,
      date: new Date(s.startTime).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
      rowsPerHour: hours > 0 ? Math.round((rows / hours) * 10) / 10 : null,
    };
  });
}

const WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const WEEKDAY_LABELS_FULL = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];

export function mostProductiveWeekday(
  rowHistory: RowHistoryEntry[],
): { index: number; label: string; count: number } | null {
  const counts = new Array(7).fill(0);
  for (const entry of rowHistory) {
    if (entry.action !== "increment") continue;
    counts[new Date(entry.timestamp).getDay()]++;
  }
  const max = Math.max(...counts);
  if (max === 0) return null;
  const index = counts.indexOf(max);
  return { index, label: WEEKDAY_LABELS_FULL[index], count: max };
}

export function weekdayBreakdown(rowHistory: RowHistoryEntry[]): { day: string; rows: number }[] {
  const counts = new Array(7).fill(0);
  for (const entry of rowHistory) {
    if (entry.action !== "increment") continue;
    counts[new Date(entry.timestamp).getDay()]++;
  }
  // Start week on Monday for display
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((i) => ({ day: WEEKDAY_LABELS[i], rows: counts[i] }));
}

export function averageSessionLength(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  return sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / sessions.length;
}

export function timeOfDayHistogram(sessions: SessionRecord[]): { hour: number; count: number }[] {
  const buckets = new Array(24).fill(0);
  for (const s of sessions) {
    buckets[new Date(s.startTime).getHours()]++;
  }
  return buckets.map((count, hour) => ({ hour, count }));
}

export interface YarnTotals {
  skeins: number;
  grams: number;
  meters: number;
}

export function yarnTotals(yarns: Yarn[]): YarnTotals {
  return yarns.reduce(
    (acc, y) => {
      acc.skeins += y.skeinsUsed;
      if (y.gramsPerSkein) acc.grams += y.skeinsUsed * y.gramsPerSkein;
      if (y.metersPerSkein) acc.meters += y.skeinsUsed * y.metersPerSkein;
      return acc;
    },
    { skeins: 0, grams: 0, meters: 0 },
  );
}

export function yarnByManufacturer(
  yarns: Yarn[],
): { manufacturer: string; skeins: number }[] {
  const map = new Map<string, number>();
  for (const y of yarns) {
    const key = y.manufacturer.trim() || "Не указан";
    map.set(key, (map.get(key) ?? 0) + y.skeinsUsed);
  }
  return Array.from(map.entries())
    .map(([manufacturer, skeins]) => ({ manufacturer, skeins }))
    .filter((x) => x.skeins > 0)
    .sort((a, b) => b.skeins - a.skeins)
    .slice(0, 6);
}

export function avgYarnPerItemType(
  yarns: Yarn[],
  projects: Project[],
): { itemType: string; avgGrams: number; projectCount: number }[] {
  const gramsByProject = new Map<number, number>();
  for (const y of yarns) {
    if (!y.gramsPerSkein) continue;
    gramsByProject.set(y.projectId, (gramsByProject.get(y.projectId) ?? 0) + y.skeinsUsed * y.gramsPerSkein);
  }
  const byType = new Map<string, { total: number; count: number }>();
  for (const [projectId, grams] of gramsByProject.entries()) {
    if (grams <= 0) continue;
    const project = projects.find((p) => p.id === projectId);
    if (!project) continue;
    const entry = byType.get(project.itemType) ?? { total: 0, count: 0 };
    entry.total += grams;
    entry.count += 1;
    byType.set(project.itemType, entry);
  }
  return Array.from(byType.entries())
    .map(([itemType, { total, count }]) => ({
      itemType,
      avgGrams: Math.round(total / count),
      projectCount: count,
    }))
    .sort((a, b) => b.avgGrams - a.avgGrams);
}

export function averageCompletionDays(projects: Project[]): number | null {
  const completed = projects.filter(
    (p) => p.status === "completed" && p.completedAt && p.completedAt > p.createdAt,
  );
  if (completed.length === 0) return null;
  const totalDays = completed.reduce((sum, p) => sum + (p.completedAt! - p.createdAt) / DAY_MS, 0);
  return totalDays / completed.length;
}

export interface ProjectComparisonRow {
  projectId: number;
  name: string;
  rows: number;
  hours: number;
  rowsPerHour: number | null;
  status: Project["status"];
}

export function projectComparison(
  projects: Project[],
  sessions: SessionRecord[],
): ProjectComparisonRow[] {
  const secondsByProject = new Map<number, number>();
  for (const s of sessions) {
    secondsByProject.set(s.projectId, (secondsByProject.get(s.projectId) ?? 0) + s.durationSeconds);
  }
  return projects
    .filter((p) => p.currentRow > 0 || secondsByProject.has(p.id!))
    .map((p) => {
      const seconds = secondsByProject.get(p.id!) ?? 0;
      const hours = seconds / 3600;
      return {
        projectId: p.id!,
        name: p.name,
        rows: p.currentRow,
        hours,
        rowsPerHour: hours > 0 ? Math.round((p.currentRow / hours) * 10) / 10 : null,
        status: p.status,
      };
    })
    .sort((a, b) => b.rows - a.rows);
}

export interface StaleProject {
  projectId: number;
  name: string;
  lastActivity: number;
  daysSince: number;
}

export function staleProjects(
  projects: Project[],
  rowHistory: RowHistoryEntry[],
  sessions: SessionRecord[],
): StaleProject[] {
  const lastRowActivity = new Map<number, number>();
  for (const entry of rowHistory) {
    const prev = lastRowActivity.get(entry.projectId) ?? 0;
    if (entry.timestamp > prev) lastRowActivity.set(entry.projectId, entry.timestamp);
  }
  const lastSessionActivity = new Map<number, number>();
  for (const s of sessions) {
    const prev = lastSessionActivity.get(s.projectId) ?? 0;
    if (s.endTime > prev) lastSessionActivity.set(s.projectId, s.endTime);
  }
  const now = Date.now();
  return projects
    .filter((p) => p.status !== "completed" && !p.archivedAt)
    .map((p) => {
      const lastActivity = Math.max(
        p.updatedAt,
        p.createdAt,
        lastRowActivity.get(p.id!) ?? 0,
        lastSessionActivity.get(p.id!) ?? 0,
      );
      return {
        projectId: p.id!,
        name: p.name,
        lastActivity,
        daysSince: Math.floor((now - lastActivity) / DAY_MS),
      };
    })
    .sort((a, b) => b.daysSince - a.daysSince);
}

export function longestProjectByTime(
  sessions: SessionRecord[],
  projects: Project[],
): { name: string; hours: number } | null {
  const seconds = new Map<number, number>();
  for (const s of sessions) seconds.set(s.projectId, (seconds.get(s.projectId) ?? 0) + s.durationSeconds);
  let best: { projectId: number; seconds: number } | null = null;
  for (const [projectId, sec] of seconds.entries()) {
    if (!best || sec > best.seconds) best = { projectId, seconds: sec };
  }
  if (!best) return null;
  const project = projects.find((p) => p.id === best!.projectId);
  return { name: project?.name ?? "Проект удалён", hours: best.seconds / 3600 };
}

export function longestProjectByRows(projects: Project[]): { name: string; rows: number } | null {
  const withRows = projects.filter((p) => p.currentRow > 0);
  if (withRows.length === 0) return null;
  const best = withRows.reduce((a, b) => (b.currentRow > a.currentRow ? b : a));
  return { name: best.name, rows: best.currentRow };
}

export function currentStreak(rowHistory: RowHistoryEntry[]): number {
  const dates = new Set<string>();
  for (const entry of rowHistory) {
    if (entry.action === "increment") dates.add(dayKey(entry.timestamp));
  }
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dates.has(dayKey(cursor.getTime()))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!dates.has(dayKey(cursor.getTime()))) return 0;
  }
  let streak = 0;
  while (dates.has(dayKey(cursor.getTime()))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
