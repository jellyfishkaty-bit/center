import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2, X } from "lucide-react";
import { db } from "../db/db";
import type { Project } from "../db/types";
import { repeatPosition } from "../db/operations";

export default function RepeatsTab({ project }: { project: Project }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [length, setLength] = useState("");
  const [startRow, setStartRow] = useState(String(project.currentRow + 1));

  const repeats = useLiveQuery(
    () => db.repeats.where("projectId").equals(project.id!).toArray(),
    [project.id],
  );

  async function addRepeat() {
    const lengthNum = Number(length);
    const startRowNum = Number(startRow) || 1;
    if (!name.trim() || !lengthNum || lengthNum <= 0) return;
    await db.repeats.add({
      projectId: project.id!,
      name: name.trim(),
      length: lengthNum,
      startRow: startRowNum,
    });
    setName("");
    setLength("");
    setStartRow(String(project.currentRow + 1));
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          Раппорт считается автоматически по текущему ряду проекта.
        </p>
      </div>

      {repeats?.map((repeat) => {
        const { repeatNumber, rowInRepeat } = repeatPosition(project.currentRow, repeat);
        return (
          <div key={repeat.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="section-title text-lg">{repeat.name}</p>
                <p className="text-xs text-ink-500">
                  {repeat.length} рядов в повторе · старт с ряда {repeat.startRow}
                </p>
              </div>
              <button
                onClick={() => db.repeats.delete(repeat.id!)}
                className="text-ink-500/50 hover:text-red-500 tap-target"
              >
                <Trash2 size={17} />
              </button>
            </div>
            {project.currentRow < repeat.startRow ? (
              <p className="text-sm text-ink-500">Ещё не начался (с ряда {repeat.startRow})</p>
            ) : (
              <div className="flex items-center gap-4 mt-1">
                <div className="text-center">
                  <p className="text-3xl font-bold text-terracotta-600">{repeatNumber}</p>
                  <p className="text-xs text-ink-500">повтор №</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-sage-600">
                    {rowInRepeat}/{repeat.length}
                  </p>
                  <p className="text-xs text-ink-500">ряд внутри повтора</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {repeats?.length === 0 && !showForm && (
        <p className="text-center text-ink-500 text-sm py-6">
          Пока нет раппортов. Добавьте узор на теле изделия или на рукавах отдельно.
        </p>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary py-3 flex items-center justify-center gap-2 tap-target"
        >
          <Plus size={18} /> Добавить раппорт
        </button>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="card p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title text-lg">Новый раппорт</p>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            <label className="label">Название</label>
            <input
              className="input-field mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, узор на рукавах"
              autoFocus
            />
            <label className="label">Длина раппорта (рядов)</label>
            <input
              type="number"
              className="input-field mb-3"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Например, 8"
              min={1}
            />
            <label className="label">Начать с ряда</label>
            <input
              type="number"
              className="input-field mb-4"
              value={startRow}
              onChange={(e) => setStartRow(e.target.value)}
              min={1}
            />
            <button onClick={addRepeat} className="btn-primary w-full py-3">
              Добавить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
