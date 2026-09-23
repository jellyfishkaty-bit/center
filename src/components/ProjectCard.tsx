import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Project } from "../db/types";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { Scissors, Waypoints, Plus } from "lucide-react";
import { changeRow } from "../db/operations";

const statusLabel: Record<Project["status"], string> = {
  in_progress: "В работе",
  completed: "Завершён",
  paused: "Отложен",
};

const statusStyle: Record<Project["status"], string> = {
  in_progress: "bg-sage-100 text-sage-700",
  completed: "bg-terracotta-100 text-terracotta-700",
  paused: "bg-cream-200 text-ink-500",
};

export default function ProjectCard({ project }: { project: Project }) {
  const cover = useLiveQuery(
    () => (project.coverPhotoId ? db.photos.get(project.coverPhotoId) : undefined),
    [project.coverPhotoId],
  );
  const coverUrl = useObjectUrl(cover?.blob);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card flex gap-3 p-3 items-center active:scale-[0.99] transition-transform"
    >
      <div className="w-16 h-16 rounded-xl bg-cream-200 shrink-0 overflow-hidden flex items-center justify-center">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : project.technique === "crochet" ? (
          <Waypoints className="text-terracotta-300" size={28} />
        ) : (
          <Scissors className="text-terracotta-300" size={28} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base truncate">{project.name}</h3>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle[project.status]}`}
          >
            {statusLabel[project.status]}
          </span>
        </div>
        <p className="text-sm text-ink-500 truncate">{project.itemType}</p>
        <p className="text-sm text-terracotta-600 font-medium mt-0.5">
          Ряд {project.currentRow}
        </p>
      </div>
      {project.status === "in_progress" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changeRow(project, 1);
          }}
          aria-label="Плюс один ряд"
          className="w-12 h-12 rounded-full bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-soft active:scale-90 tap-target"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      )}
    </Link>
  );
}
