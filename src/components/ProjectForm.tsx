import { useState } from "react";
import type { Project, Technique } from "../db/types";
import { PROJECT_TYPES } from "../db/types";

export interface ProjectFormValues {
  name: string;
  itemType: string;
  technique: Technique;
  toolSize: string;
  startDate: string;
  status: Project["status"];
}

export default function ProjectForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ProjectFormValues>;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [itemType, setItemType] = useState(initial?.itemType ?? PROJECT_TYPES[0]);
  const [technique, setTechnique] = useState<Technique>(initial?.technique ?? "needles");
  const [toolSize, setToolSize] = useState(initial?.toolSize ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<Project["status"]>(initial?.status ?? "in_progress");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), itemType, technique, toolSize, startDate, status });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="label">Название проекта</label>
        <input
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, свитер для мамы"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="label">Тип изделия</label>
        <select
          className="input-field"
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Техника</label>
        <div className="grid grid-cols-2 gap-2">
          {(["needles", "crochet"] as Technique[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTechnique(t)}
              className={`py-2.5 rounded-xl font-medium tap-target ${
                technique === t
                  ? "bg-terracotta-500 text-white"
                  : "bg-white border border-cream-300 text-ink-700"
              }`}
            >
              {t === "needles" ? "Спицы" : "Крючок"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Размер инструмента (опционально)</label>
        <input
          className="input-field"
          value={toolSize}
          onChange={(e) => setToolSize(e.target.value)}
          placeholder="Например, №4"
        />
      </div>

      <div>
        <label className="label">Дата начала</label>
        <input
          type="date"
          className="input-field"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Статус</label>
        <select
          className="input-field"
          value={status}
          onChange={(e) => setStatus(e.target.value as Project["status"])}
        >
          <option value="in_progress">В работе</option>
          <option value="paused">Отложен</option>
          <option value="completed">Завершён</option>
        </select>
      </div>

      <button type="submit" className="btn-primary py-3 mt-2">
        {submitLabel}
      </button>
    </form>
  );
}
