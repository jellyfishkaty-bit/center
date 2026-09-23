import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, X } from "lucide-react";
import { db } from "../db/db";
import type { Pattern, Project } from "../db/types";
import PatternCard from "./PatternCard";
import PatternForm, { type PatternFormValues } from "./PatternForm";

export default function PatternsTab({ project }: { project: Project }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pattern | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const patterns = useLiveQuery(
    () => db.patterns.where("projectId").equals(project.id!).toArray(),
    [project.id],
  );

  const favorites = useLiveQuery(
    () =>
      db.patterns
        .filter((p) => p.isFavorite && p.projectId !== project.id)
        .toArray(),
    [project.id],
  );

  async function save(values: PatternFormValues) {
    if (editing) {
      await db.patterns.update(editing.id!, values);
    } else {
      await db.patterns.add({ ...values, projectId: project.id!, createdAt: Date.now() });
    }
    setShowForm(false);
    setEditing(null);
  }

  async function useFromLibrary(pattern: Pattern) {
    const { id: _id, ...rest } = pattern;
    await db.patterns.add({ ...rest, projectId: project.id!, createdAt: Date.now() });
    setShowLibrary(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary py-3 flex items-center justify-center gap-1.5 text-sm"
        >
          <Plus size={16} /> Новый узор
        </button>
        <button
          onClick={() => setShowLibrary(true)}
          className="btn-secondary py-3 text-sm"
        >
          Из избранного
        </button>
      </div>

      {patterns?.length === 0 && (
        <p className="text-center text-ink-500 text-sm py-6">
          Пока нет узоров для этого проекта.
        </p>
      )}

      {patterns?.map((p) => (
        <PatternCard
          key={p.id}
          pattern={p}
          onToggleFavorite={() =>
            db.patterns.update(p.id!, { isFavorite: !p.isFavorite })
          }
          onDelete={() => db.patterns.delete(p.id!)}
          onEdit={() => {
            setEditing(p);
            setShowForm(true);
          }}
        />
      ))}

      {showForm && (
        <PatternForm
          initial={editing ?? undefined}
          onSave={save}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {showLibrary && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="card p-5 w-full sm:max-w-sm max-h-[75vh] overflow-y-auto rounded-b-none sm:rounded-b-xl2">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title text-lg">Избранные узоры</p>
              <button onClick={() => setShowLibrary(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            {favorites?.length === 0 && (
              <p className="text-ink-500 text-sm">
                В избранном пока пусто. Отметьте звёздочкой узор в любом проекте.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {favorites?.map((p) => (
                <button
                  key={p.id}
                  onClick={() => useFromLibrary(p)}
                  className="text-left px-3 py-2.5 rounded-lg border border-cream-200 hover:bg-cream-100"
                >
                  <p className="font-medium text-ink-900 text-sm">{p.name}</p>
                  {p.notes && <p className="text-xs text-ink-500">{p.notes}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
