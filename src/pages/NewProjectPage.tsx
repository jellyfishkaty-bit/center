import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { db } from "../db/db";
import ProjectForm, { type ProjectFormValues } from "../components/ProjectForm";

export default function NewProjectPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: ProjectFormValues) {
    const now = Date.now();
    const id = await db.projects.add({
      ...values,
      currentRow: 0,
      stitchTarget: null,
      stitchCurrent: 0,
      autoResetStitches: true,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    });
    navigate(`/projects/${id}`, { replace: true });
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-ink-500 mb-3 tap-target"
      >
        <ChevronLeft size={20} /> Назад
      </button>
      <h1 className="text-3xl mb-5">Новый проект</h1>
      <ProjectForm submitLabel="Создать проект" onSubmit={handleSubmit} />
    </div>
  );
}
