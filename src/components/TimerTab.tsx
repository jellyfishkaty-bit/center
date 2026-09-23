import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Pause, Play, Square } from "lucide-react";
import { db, getSetting, setSetting } from "../db/db";
import type { Project } from "../db/types";

interface ActiveSession {
  startedAt: number | null;
  accumulatedSeconds: number;
  rowsAtStart: number;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}ч ${m}м ${s}с`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

export default function TimerTab({ project }: { project: Project }) {
  const settingsKey = `activeSession:${project.id}`;
  const [active, setActive] = useState<ActiveSession | null | undefined>(undefined);
  const [, forceTick] = useState(0);

  useEffect(() => {
    getSetting<ActiveSession | null>(settingsKey, null).then(setActive);
  }, [settingsKey]);

  useEffect(() => {
    if (!active?.startedAt) return;
    const interval = setInterval(() => forceTick((v) => v + 1), 1000);
    return () => clearInterval(interval);
  }, [active?.startedAt]);

  const sessions = useLiveQuery(
    () =>
      db.sessions
        .where("projectId")
        .equals(project.id!)
        .reverse()
        .sortBy("startTime"),
    [project.id],
  );

  const totalSeconds = sessions?.reduce((sum, s) => sum + s.durationSeconds, 0) ?? 0;
  const elapsed = active
    ? active.accumulatedSeconds + (active.startedAt ? (Date.now() - active.startedAt) / 1000 : 0)
    : 0;

  async function updateActive(next: ActiveSession | null) {
    setActive(next);
    await setSetting(settingsKey, next);
  }

  async function start() {
    await updateActive({
      startedAt: Date.now(),
      accumulatedSeconds: 0,
      rowsAtStart: project.currentRow,
    });
  }

  async function pause() {
    if (!active?.startedAt) return;
    await updateActive({
      ...active,
      startedAt: null,
      accumulatedSeconds: active.accumulatedSeconds + (Date.now() - active.startedAt) / 1000,
    });
  }

  async function resume() {
    if (!active || active.startedAt) return;
    await updateActive({ ...active, startedAt: Date.now() });
  }

  async function stop() {
    if (!active) return;
    const finalSeconds = Math.round(
      active.accumulatedSeconds + (active.startedAt ? (Date.now() - active.startedAt) / 1000 : 0),
    );
    if (finalSeconds >= 5) {
      await db.sessions.add({
        projectId: project.id!,
        startTime: Date.now() - finalSeconds * 1000,
        endTime: Date.now(),
        durationSeconds: finalSeconds,
        rowsAtStart: active.rowsAtStart,
        rowsAtEnd: project.currentRow,
      });
    }
    await updateActive(null);
  }

  if (active === undefined) return null;

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-6 text-center">
        <p className="text-sm font-medium text-ink-500 mb-2">Сессия вязания</p>
        <p className="text-5xl font-extrabold text-terracotta-600 mb-5 tabular-nums">
          {formatDuration(elapsed)}
        </p>

        {!active && (
          <button
            onClick={start}
            className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-2"
          >
            <Play size={22} /> Начать сессию
          </button>
        )}

        {active && (
          <div className="grid grid-cols-2 gap-3">
            {active.startedAt ? (
              <button
                onClick={pause}
                className="btn-secondary py-4 flex items-center justify-center gap-2"
              >
                <Pause size={18} /> Пауза
              </button>
            ) : (
              <button
                onClick={resume}
                className="btn-primary py-4 flex items-center justify-center gap-2"
              >
                <Play size={18} /> Продолжить
              </button>
            )}
            <button
              onClick={stop}
              className="py-4 rounded-xl2 bg-terracotta-600 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Square size={18} /> Завершить
            </button>
          </div>
        )}
      </section>

      <section className="card p-4">
        <p className="section-title text-lg mb-1">Всего потрачено времени</p>
        <p className="text-2xl font-bold text-sage-600">{formatDuration(totalSeconds)}</p>
      </section>

      <section>
        <p className="section-title text-lg mb-2">История сессий</p>
        {sessions?.length === 0 && (
          <p className="text-sm text-ink-500">Пока нет завершённых сессий.</p>
        )}
        <div className="flex flex-col gap-2">
          {sessions?.map((s) => {
            const rows = Math.max(0, s.rowsAtEnd - s.rowsAtStart);
            const rowsPerHour = s.durationSeconds > 0 ? Math.round((rows / s.durationSeconds) * 3600) : 0;
            return (
              <div key={s.id} className="card p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink-900 font-medium">
                    {new Date(s.startTime).toLocaleDateString("ru-RU")}
                  </p>
                  <p className="text-ink-500 text-xs">
                    {formatDuration(s.durationSeconds)} · {rows} рядов
                  </p>
                </div>
                {rowsPerHour > 0 && (
                  <p className="text-sage-600 font-medium text-xs">{rowsPerHour} р/ч</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
