import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2, X, TriangleAlert } from "lucide-react";
import { db } from "../db/db";
import type { Project, Yarn } from "../db/types";

const emptyForm = {
  name: "",
  manufacturer: "",
  color: "",
  dyeLot: "",
  skeinsTotal: "",
  skeinsUsed: "0",
  gramsPerSkein: "",
  metersPerSkein: "",
};

export default function YarnTab({ project }: { project: Project }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Yarn | null>(null);
  const [form, setForm] = useState(emptyForm);

  const yarns = useLiveQuery(
    () => db.yarns.where("projectId").equals(project.id!).toArray(),
    [project.id],
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(yarn: Yarn) {
    setEditing(yarn);
    setForm({
      name: yarn.name,
      manufacturer: yarn.manufacturer,
      color: yarn.color,
      dyeLot: yarn.dyeLot,
      skeinsTotal: String(yarn.skeinsTotal),
      skeinsUsed: String(yarn.skeinsUsed),
      gramsPerSkein: yarn.gramsPerSkein ? String(yarn.gramsPerSkein) : "",
      metersPerSkein: yarn.metersPerSkein ? String(yarn.metersPerSkein) : "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    const payload: Omit<Yarn, "id"> = {
      projectId: project.id!,
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      color: form.color.trim(),
      dyeLot: form.dyeLot.trim(),
      skeinsTotal: Number(form.skeinsTotal) || 0,
      skeinsUsed: Number(form.skeinsUsed) || 0,
      gramsPerSkein: form.gramsPerSkein ? Number(form.gramsPerSkein) : undefined,
      metersPerSkein: form.metersPerSkein ? Number(form.metersPerSkein) : undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    if (editing) {
      await db.yarns.update(editing.id!, payload);
    } else {
      await db.yarns.add(payload);
    }
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {yarns?.length === 0 && (
        <p className="text-center text-ink-500 text-sm py-6">
          Пока не добавлена пряжа для этого проекта.
        </p>
      )}

      {yarns?.map((yarn) => {
        const remaining = yarn.skeinsTotal - yarn.skeinsUsed;
        const low = remaining < 1;
        return (
          <div key={yarn.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <button className="text-left flex-1" onClick={() => openEdit(yarn)}>
                <p className="font-semibold text-ink-900">{yarn.name}</p>
                <p className="text-xs text-ink-500">
                  {yarn.manufacturer && `${yarn.manufacturer} · `}
                  {yarn.color}
                  {yarn.dyeLot && ` · партия ${yarn.dyeLot}`}
                </p>
              </button>
              <button
                onClick={() => db.yarns.delete(yarn.id!)}
                className="tap-target text-ink-500/40 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-ink-700">
                Осталось <span className="font-semibold">{remaining}</span> из{" "}
                {yarn.skeinsTotal} мотков
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center tap-target"
                  onClick={() =>
                    db.yarns.update(yarn.id!, {
                      skeinsUsed: Math.max(0, yarn.skeinsUsed - 1),
                    })
                  }
                >
                  -
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-sage-500 text-white flex items-center justify-center tap-target"
                  onClick={() =>
                    db.yarns.update(yarn.id!, {
                      skeinsUsed: yarn.skeinsUsed + 1,
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>

            {(yarn.gramsPerSkein || yarn.metersPerSkein) && (
              <p className="text-xs text-ink-500 mt-1">
                Израсходовано:{" "}
                {yarn.gramsPerSkein && `${yarn.skeinsUsed * yarn.gramsPerSkein} г`}
                {yarn.gramsPerSkein && yarn.metersPerSkein && " · "}
                {yarn.metersPerSkein && `${yarn.skeinsUsed * yarn.metersPerSkein} м`}
              </p>
            )}

            {low && (
              <div className="flex items-center gap-1.5 mt-2 bg-terracotta-100 text-terracotta-700 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                <TriangleAlert size={14} /> Осталось меньше 1 мотка
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={openNew}
        className="btn-secondary py-3 flex items-center justify-center gap-2 tap-target"
      >
        <Plus size={18} /> Добавить пряжу
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="card p-5 w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl2">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink-900">Пряжа</p>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>

            <label className="label">Название</label>
            <input
              className="input-field mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Например, Merino Deluxe"
              autoFocus
            />
            <label className="label">Производитель</label>
            <input
              className="input-field mb-3"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">Цвет</label>
                <input
                  className="input-field"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Партия (dye lot)</label>
                <input
                  className="input-field"
                  value={form.dyeLot}
                  onChange={(e) => setForm({ ...form, dyeLot: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">Мотков всего</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.skeinsTotal}
                  onChange={(e) => setForm({ ...form, skeinsTotal: e.target.value })}
                  min={0}
                />
              </div>
              <div>
                <label className="label">Использовано</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.skeinsUsed}
                  onChange={(e) => setForm({ ...form, skeinsUsed: e.target.value })}
                  min={0}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Грамм в мотке</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.gramsPerSkein}
                  onChange={(e) => setForm({ ...form, gramsPerSkein: e.target.value })}
                  min={0}
                />
              </div>
              <div>
                <label className="label">Метров в мотке</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.metersPerSkein}
                  onChange={(e) => setForm({ ...form, metersPerSkein: e.target.value })}
                  min={0}
                />
              </div>
            </div>

            <button className="btn-primary w-full py-3" onClick={save}>
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
