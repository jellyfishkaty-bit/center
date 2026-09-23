import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { db } from "../db/db";
import type { Pattern } from "../db/types";
import PatternCard from "../components/PatternCard";
import PatternForm, { type PatternFormValues } from "../components/PatternForm";

export default function PatternLibraryPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pattern | null>(null);

  const favorites = useLiveQuery(
    () => db.patterns.filter((p) => p.isFavorite).toArray(),
    [],
  );

  const projects = useLiveQuery(() => db.projects.toArray(), []);
  const projectName = (id: number | null) =>
    id ? projects?.find((p) => p.id === id)?.name : null;

  async function save(values: PatternFormValues) {
    if (editing) {
      await db.patterns.update(editing.id!, values);
    } else {
      await db.patterns.add({
        ...values,
        projectId: null,
        isFavorite: true,
        createdAt: Date.now(),
      });
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">Избранные узоры</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary w-11 h-11 flex items-center justify-center tap-target"
          aria-label="Новый узор"
        >
          <Plus size={24} />
        </button>
      </div>

      <p className="text-sm text-ink-500 mb-4">
        Узоры, отмеченные звёздочкой в любом проекте, попадают сюда и доступны для
        переиспользования.
      </p>

      {favorites?.length === 0 && (
        <p className="text-center text-ink-500 mt-10">Пока нет избранных узоров.</p>
      )}

      <div className="flex flex-col gap-3">
        {favorites?.map((p) => (
          <div key={p.id}>
            <PatternCard
              pattern={p}
              onToggleFavorite={() => db.patterns.update(p.id!, { isFavorite: false })}
              onDelete={() => db.patterns.delete(p.id!)}
              onEdit={() => {
                setEditing(p);
                setShowForm(true);
              }}
            />
            {projectName(p.projectId) && (
              <p className="text-xs text-ink-500 mt-1 ml-1">
                Из проекта: {projectName(p.projectId)}
              </p>
            )}
          </div>
        ))}
      </div>

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
    </div>
  );
}
