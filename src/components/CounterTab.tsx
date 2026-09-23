import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Minus, Plus, RotateCcw, Undo2, History, Pencil, X } from "lucide-react";
import { db } from "../db/db";
import type { Project } from "../db/types";
import {
  changeRow,
  changeStitch,
  resetRow,
  setRow,
  setStitchTarget,
  undoLastRowChange,
} from "../db/operations";

function ConfirmDialog({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="card p-5 w-full max-w-sm">
        <p className="text-ink-900 font-medium mb-4">{title}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl2 bg-terracotta-600 text-white font-semibold"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CounterTab({ project }: { project: Project }) {
  const [showReset, setShowReset] = useState(false);
  const [showManualRow, setShowManualRow] = useState(false);
  const [manualRow, setManualRow] = useState(String(project.currentRow));
  const [showTarget, setShowTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(project.stitchTarget ?? ""));
  const [showHistory, setShowHistory] = useState(false);

  const history = useLiveQuery(
    () =>
      db.rowHistory
        .where("projectId")
        .equals(project.id!)
        .reverse()
        .sortBy("timestamp")
        .then((rows) => rows.slice(0, 30)),
    [project.id],
  );

  const progress =
    project.stitchTarget && project.stitchTarget > 0
      ? Math.min(100, Math.round((project.stitchCurrent / project.stitchTarget) * 100))
      : null;

  return (
    <div className="flex flex-col gap-5">
      <section className="card p-5 text-center">
        <p className="text-sm font-medium text-ink-500 mb-1">Текущий ряд</p>
        <button
          onClick={() => {
            setManualRow(String(project.currentRow));
            setShowManualRow(true);
          }}
          className="text-6xl font-extrabold text-terracotta-600 tap-target mb-4 flex items-center justify-center gap-2 mx-auto"
        >
          {project.currentRow}
          <Pencil size={20} className="text-terracotta-300" />
        </button>

        <button
          onClick={() => changeRow(project, 1)}
          className="btn-primary w-full py-7 text-2xl tap-target flex items-center justify-center gap-2"
        >
          <Plus size={28} strokeWidth={3} /> Ряд
        </button>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => changeRow(project, -1)}
            disabled={project.currentRow === 0}
            className="btn-secondary py-4 tap-target flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Minus size={20} /> Ряд
          </button>
          <button
            onClick={() => undoLastRowChange(project)}
            className="btn-secondary py-4 tap-target flex items-center justify-center gap-1"
          >
            <Undo2 size={18} /> Отменить
          </button>
          <button
            onClick={() => setShowReset(true)}
            className="btn-secondary py-4 tap-target flex items-center justify-center gap-1 text-terracotta-600"
          >
            <RotateCcw size={18} /> Сброс
          </button>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="text-sm text-ink-500 mt-4 flex items-center gap-1 mx-auto tap-target"
        >
          <History size={15} /> История изменений
        </button>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title text-lg">Петли в ряду</p>
          <label className="flex items-center gap-2 text-xs text-ink-500">
            <input
              type="checkbox"
              checked={project.autoResetStitches}
              onChange={(e) =>
                db.projects.update(project.id!, {
                  autoResetStitches: e.target.checked,
                  updatedAt: Date.now(),
                })
              }
            />
            Сброс при новом ряду
          </label>
        </div>

        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            onClick={() => changeStitch(project, -1)}
            disabled={project.stitchCurrent === 0}
            className="btn-secondary w-16 h-16 rounded-full flex items-center justify-center tap-target disabled:opacity-40"
          >
            <Minus size={26} />
          </button>
          <span className="text-4xl font-bold text-ink-900 min-w-20 text-center">
            {project.stitchCurrent}
          </span>
          <button
            onClick={() => changeStitch(project, 1)}
            className="w-16 h-16 rounded-full flex items-center justify-center tap-target bg-sage-500 text-white shadow-soft active:scale-95"
          >
            <Plus size={26} />
          </button>
        </div>

        {progress !== null ? (
          <div>
            <div className="flex justify-between text-sm text-ink-500 mb-1">
              <span>
                {project.stitchCurrent} из {project.stitchTarget} петель
              </span>
              <button
                onClick={() => {
                  setTargetInput(String(project.stitchTarget));
                  setShowTarget(true);
                }}
                className="text-terracotta-600 font-medium"
              >
                Изменить
              </button>
            </div>
            <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setTargetInput("");
              setShowTarget(true);
            }}
            className="text-sm text-terracotta-600 font-medium mx-auto block"
          >
            + Задать целевое количество петель
          </button>
        )}
      </section>

      {showReset && (
        <ConfirmDialog
          title="Сбросить счётчики ряда и петель до нуля?"
          onConfirm={() => {
            resetRow(project);
            setShowReset(false);
          }}
          onCancel={() => setShowReset(false)}
        />
      )}

      {showManualRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="card p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title text-lg">Установить ряд вручную</p>
              <button onClick={() => setShowManualRow(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            <input
              type="number"
              className="input-field mb-4"
              value={manualRow}
              onChange={(e) => setManualRow(e.target.value)}
              autoFocus
              min={0}
            />
            <button
              className="btn-primary w-full py-3"
              onClick={() => {
                const value = Number(manualRow);
                if (!Number.isNaN(value)) setRow(project, value);
                setShowManualRow(false);
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {showTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="card p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title text-lg">Целевое количество петель</p>
              <button onClick={() => setShowTarget(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            <input
              type="number"
              className="input-field mb-4"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Например, 24"
              autoFocus
              min={0}
            />
            <div className="flex gap-2">
              {project.stitchTarget !== null && (
                <button
                  className="btn-secondary flex-1 py-3"
                  onClick={() => {
                    setStitchTarget(project, null);
                    setShowTarget(false);
                  }}
                >
                  Убрать цель
                </button>
              )}
              <button
                className="btn-primary flex-1 py-3"
                onClick={() => {
                  const value = Number(targetInput);
                  setStitchTarget(project, Number.isNaN(value) || value <= 0 ? null : value);
                  setShowTarget(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="card p-5 w-full sm:max-w-sm max-h-[75vh] overflow-y-auto rounded-b-none sm:rounded-b-xl2">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white">
              <p className="section-title text-lg">История изменений</p>
              <button onClick={() => setShowHistory(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {history?.length === 0 && (
                <li className="text-ink-500 text-sm">Пока нет изменений.</li>
              )}
              {history?.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between text-sm border-b border-cream-200 pb-2"
                >
                  <span className="text-ink-700">
                    {entry.action === "increment" && "→ +1 ряд"}
                    {entry.action === "decrement" && "→ -1 ряд"}
                    {entry.action === "set" && "→ установлено вручную"}
                    {entry.action === "reset" && "→ сброс"}
                    {" "}
                    (ряд {entry.row})
                  </span>
                  <span className="text-ink-500 shrink-0 ml-2">
                    {new Date(entry.timestamp).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
