import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Star, Trash2, X } from "lucide-react";
import { db } from "../db/db";
import type { Project } from "../db/types";

export default function NotesTab({ project }: { project: Project }) {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [row, setRow] = useState("");
  const [important, setImportant] = useState(false);
  const [filterImportant, setFilterImportant] = useState(false);

  const notes = useLiveQuery(
    () =>
      db.notes
        .where("projectId")
        .equals(project.id!)
        .reverse()
        .sortBy("createdAt"),
    [project.id],
  );

  const visible = filterImportant ? notes?.filter((n) => n.important) : notes;

  async function save() {
    if (!text.trim()) return;
    await db.notes.add({
      projectId: project.id!,
      row: row ? Number(row) : null,
      text: text.trim(),
      important,
      createdAt: Date.now(),
    });
    setText("");
    setRow("");
    setImportant(false);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setRow(String(project.currentRow));
            setShowForm(true);
          }}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Новая заметка
        </button>
        <button
          onClick={() => setFilterImportant((v) => !v)}
          className={`px-4 rounded-xl2 flex items-center gap-1.5 text-sm font-medium tap-target ${
            filterImportant
              ? "bg-terracotta-500 text-white"
              : "bg-white border border-cream-300 text-ink-700"
          }`}
        >
          <Star size={15} /> Важные
        </button>
      </div>

      {visible?.length === 0 && (
        <p className="text-center text-ink-500 text-sm py-6">
          {filterImportant ? "Нет важных заметок." : "Пока нет заметок."}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {visible?.map((note) => (
          <div key={note.id} className="card p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-ink-700 whitespace-pre-wrap">{note.text}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {note.row !== null && `Ряд ${note.row} · `}
                  {new Date(note.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => db.notes.update(note.id!, { important: !note.important })}
                  className="tap-target"
                >
                  <Star
                    size={16}
                    className={note.important ? "fill-burgundy-400 text-burgundy-400" : "text-ink-500/40"}
                  />
                </button>
                <button
                  onClick={() => db.notes.delete(note.id!)}
                  className="tap-target text-ink-500/40 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="card p-5 w-full sm:max-w-sm rounded-b-none sm:rounded-b-xl2">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title text-lg">Новая заметка</p>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>

            <textarea
              className="input-field mb-3 min-h-24"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Например, тут была ошибка, пришлось распускать"
              autoFocus
            />

            <label className="label">Привязать к ряду (необязательно)</label>
            <input
              type="number"
              className="input-field mb-3"
              value={row}
              onChange={(e) => setRow(e.target.value)}
              placeholder="Оставьте пустым для общей заметки"
            />

            <label className="flex items-center gap-2 text-sm text-ink-700 mb-4">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
              />
              Отметить как важную
            </label>

            <button className="btn-primary w-full py-3" onClick={save}>
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
