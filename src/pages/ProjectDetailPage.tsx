import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { db } from "../db/db";
import { archiveProject, deleteProjectCascade, duplicateProject, unarchiveProject } from "../db/operations";
import CounterTab from "../components/CounterTab";
import RepeatsTab from "../components/RepeatsTab";
import PatternsTab from "../components/PatternsTab";
import YarnTab from "../components/YarnTab";
import PhotosTab from "../components/PhotosTab";
import NotesTab from "../components/NotesTab";
import TimerTab from "../components/TimerTab";

const tabs = [
  { key: "counter", label: "Счётчик" },
  { key: "repeats", label: "Раппорты" },
  { key: "patterns", label: "Узоры" },
  { key: "yarn", label: "Пряжа" },
  { key: "photos", label: "Фото" },
  { key: "notes", label: "Заметки" },
  { key: "timer", label: "Таймер" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("counter");
  const [menuOpen, setMenuOpen] = useState(false);

  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);

  if (!project) {
    return (
      <div className="text-center text-ink-500 mt-10">Загрузка...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-ink-500 tap-target"
        >
          <ChevronLeft size={20} /> Проекты
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center tap-target text-ink-500"
          >
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 card p-1.5 w-48 z-20 flex flex-col">
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-cream-100 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Редактировать
                </Link>
                <button
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-cream-100 text-sm"
                  onClick={async () => {
                    const newId = await duplicateProject(project);
                    setMenuOpen(false);
                    navigate(`/projects/${newId}`);
                  }}
                >
                  Дублировать проект
                </button>
                {project.archivedAt ? (
                  <button
                    className="text-left px-3 py-2.5 rounded-lg hover:bg-cream-100 text-sm"
                    onClick={() => {
                      unarchiveProject(project.id!);
                      setMenuOpen(false);
                    }}
                  >
                    Вернуть из архива
                  </button>
                ) : (
                  <button
                    className="text-left px-3 py-2.5 rounded-lg hover:bg-cream-100 text-sm"
                    onClick={() => {
                      archiveProject(project.id!);
                      setMenuOpen(false);
                    }}
                  >
                    Архивировать
                  </button>
                )}
                <button
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-red-50 text-sm text-red-600"
                  onClick={async () => {
                    if (confirm(`Удалить проект «${project.name}» и все его данные?`)) {
                      await deleteProjectCascade(project.id!);
                      navigate("/");
                    }
                    setMenuOpen(false);
                  }}
                >
                  Удалить проект
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-ink-900 mb-1">{project.name}</h1>
      <p className="text-sm text-ink-500 mb-4">
        {project.itemType} · {project.technique === "needles" ? "Спицы" : "Крючок"}
        {project.toolSize ? ` №${project.toolSize.replace(/^№/, "")}` : ""}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-4 px-4 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium tap-target ${
              tab === t.key
                ? "bg-terracotta-500 text-white"
                : "bg-white text-ink-500 border border-cream-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "counter" && <CounterTab project={project} />}
      {tab === "repeats" && <RepeatsTab project={project} />}
      {tab === "patterns" && <PatternsTab project={project} />}
      {tab === "yarn" && <YarnTab project={project} />}
      {tab === "photos" && <PhotosTab project={project} />}
      {tab === "notes" && <NotesTab project={project} />}
      {tab === "timer" && <TimerTab project={project} />}
    </div>
  );
}
