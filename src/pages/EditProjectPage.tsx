import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft } from "lucide-react";
import { db } from "../db/db";
import ProjectForm, { type ProjectFormValues } from "../components/ProjectForm";

export default function EditProjectPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();
  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);

  async function handleSubmit(values: ProjectFormValues) {
    await db.projects.update(projectId, { ...values, updatedAt: Date.now() });
    navigate(`/projects/${projectId}`, { replace: true });
  }

  if (!project) return null;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-ink-500 mb-3 tap-target"
      >
        <ChevronLeft size={20} /> Назад
      </button>
      <h1 className="text-2xl font-bold text-ink-900 mb-5">Редактировать проект</h1>
      <ProjectForm initial={project} submitLabel="Сохранить" onSubmit={handleSubmit} />
    </div>
  );
}
