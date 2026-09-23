import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Archive } from "lucide-react";
import { db } from "../db/db";
import type { Project, ProjectStatus } from "../db/types";
import ProjectCard from "../components/ProjectCard";
import YarnIllustration from "../components/decor/YarnIllustration";

type FilterKey = "active" | ProjectStatus | "archived";

const filters: { key: FilterKey; label: string }[] = [
  { key: "active", label: "Все активные" },
  { key: "in_progress", label: "В работе" },
  { key: "paused", label: "Отложены" },
  { key: "completed", label: "Завершены" },
  { key: "archived", label: "Архив" },
];

export default function ProjectListPage() {
  const [filter, setFilter] = useState<FilterKey>("active");

  const projects = useLiveQuery(() => db.projects.orderBy("updatedAt").reverse().toArray(), []);

  const filtered = useMemo(() => {
    if (!projects) return undefined;
    return projects.filter((project: Project) => {
      const archived = !!project.archivedAt;
      if (filter === "archived") return archived;
      if (archived) return false;
      if (filter === "active") return true;
      return project.status === filter;
    });
  }, [projects, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">Мои проекты</h1>
        <Link
          to="/projects/new"
          className="btn-primary w-11 h-11 flex items-center justify-center tap-target"
          aria-label="Новый проект"
        >
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium tap-target ${
              filter === f.key
                ? "bg-terracotta-500 text-white"
                : "bg-white text-ink-500 border border-cream-300"
            }`}
          >
            {f.key === "archived" && <Archive size={13} className="inline mr-1 -mt-0.5" />}
            {f.label}
          </button>
        ))}
      </div>

      {filtered === undefined && (
        <p className="text-center text-ink-500 mt-10">Загрузка...</p>
      )}

      {filtered && filtered.length === 0 && (
        <div className="text-center mt-10 px-6">
          <YarnIllustration className="w-32 h-32 mx-auto mb-2 opacity-90" />
          <p className="accent-note text-xl mb-1">
            {filter === "archived" ? "В архиве пока пусто" : "Пока пусто, но это временно"}
          </p>
          <p className="text-ink-500 mb-4 text-sm">
            {filter === "archived"
              ? "Архивированные проекты появятся здесь."
              : "Начните первый проект — и он ляжет сюда аккуратной стопочкой."}
          </p>
          {filter !== "archived" && (
            <Link to="/projects/new" className="btn-primary inline-block px-5 py-2.5">
              Начать первый проект
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
