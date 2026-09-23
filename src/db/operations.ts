import { db } from "./db";
import type { Project, RowAction } from "./types";

async function logRowChange(projectId: number, row: number, action: RowAction) {
  await db.rowHistory.add({ projectId, row, action, timestamp: Date.now() });
}

export async function changeRow(project: Project, delta: 1 | -1): Promise<void> {
  const id = project.id!;
  const nextRow = Math.max(0, project.currentRow + delta);
  const patch: Partial<Project> = {
    currentRow: nextRow,
    updatedAt: Date.now(),
  };
  if (delta === 1 && project.autoResetStitches) {
    patch.stitchCurrent = 0;
  }
  await db.projects.update(id, patch);
  await logRowChange(id, nextRow, delta === 1 ? "increment" : "decrement");
}

export async function setRow(project: Project, row: number): Promise<void> {
  const id = project.id!;
  const nextRow = Math.max(0, Math.round(row));
  await db.projects.update(id, { currentRow: nextRow, updatedAt: Date.now() });
  await logRowChange(id, nextRow, "set");
}

export async function resetRow(project: Project): Promise<void> {
  const id = project.id!;
  await db.projects.update(id, {
    currentRow: 0,
    stitchCurrent: 0,
    updatedAt: Date.now(),
  });
  await logRowChange(id, 0, "reset");
}

export async function undoLastRowChange(project: Project): Promise<void> {
  const id = project.id!;
  const entries = await db.rowHistory
    .where("projectId")
    .equals(id)
    .sortBy("timestamp");
  if (entries.length === 0) return;
  const last = entries[entries.length - 1];
  await db.rowHistory.delete(last.id!);
  const previous = entries[entries.length - 2];
  const restoredRow = previous ? previous.row : 0;
  await db.projects.update(id, { currentRow: restoredRow, updatedAt: Date.now() });
}

export async function changeStitch(project: Project, delta: 1 | -1): Promise<void> {
  const id = project.id!;
  const nextStitch = Math.max(0, project.stitchCurrent + delta);
  await db.projects.update(id, { stitchCurrent: nextStitch, updatedAt: Date.now() });
}

export async function setStitchTarget(
  project: Project,
  target: number | null,
): Promise<void> {
  await db.projects.update(project.id!, {
    stitchTarget: target,
    updatedAt: Date.now(),
  });
}

export async function duplicateProject(project: Project): Promise<number> {
  const now = Date.now();
  const { id: _id, ...rest } = project;
  const newId = await db.projects.add({
    ...rest,
    name: `${project.name} (копия)`,
    currentRow: 0,
    stitchCurrent: 0,
    status: "in_progress",
    startDate: new Date().toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    completedAt: null,
  });

  const repeats = await db.repeats.where("projectId").equals(project.id!).toArray();
  for (const repeat of repeats) {
    const { id: _rid, ...repeatRest } = repeat;
    await db.repeats.add({ ...repeatRest, projectId: newId });
  }

  const patterns = await db.patterns.where("projectId").equals(project.id!).toArray();
  for (const pattern of patterns) {
    const { id: _pid, ...patternRest } = pattern;
    await db.patterns.add({ ...patternRest, projectId: newId, createdAt: now });
  }

  return newId;
}

export async function archiveProject(projectId: number): Promise<void> {
  await db.projects.update(projectId, {
    archivedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function unarchiveProject(projectId: number): Promise<void> {
  await db.projects.update(projectId, {
    archivedAt: null,
    updatedAt: Date.now(),
  });
}

export async function deleteProjectCascade(projectId: number): Promise<void> {
  await db.transaction(
    "rw",
    [db.projects, db.rowHistory, db.repeats, db.patterns, db.yarns, db.photos, db.sessions, db.notes],
    async () => {
      await db.rowHistory.where("projectId").equals(projectId).delete();
      await db.repeats.where("projectId").equals(projectId).delete();
      await db.patterns.where("projectId").equals(projectId).delete();
      await db.yarns.where("projectId").equals(projectId).delete();
      await db.photos.where("projectId").equals(projectId).delete();
      await db.sessions.where("projectId").equals(projectId).delete();
      await db.notes.where("projectId").equals(projectId).delete();
      await db.projects.delete(projectId);
    },
  );
}

export function repeatPosition(currentRow: number, repeat: { startRow: number; length: number }) {
  if (repeat.length <= 0) return { repeatNumber: 0, rowInRepeat: 0 };
  const offset = currentRow - repeat.startRow;
  if (offset < 0) return { repeatNumber: 0, rowInRepeat: 0 };
  const repeatNumber = Math.floor(offset / repeat.length) + 1;
  const rowInRepeat = (offset % repeat.length) + 1;
  return { repeatNumber, rowInRepeat };
}
