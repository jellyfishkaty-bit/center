import { db } from "./db";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, type = "image/jpeg"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportBackup(): Promise<Blob> {
  const [projects, rowHistory, repeats, patterns, yarns, photos, sessions, notes, reminders, settings] =
    await Promise.all([
      db.projects.toArray(),
      db.rowHistory.toArray(),
      db.repeats.toArray(),
      db.patterns.toArray(),
      db.yarns.toArray(),
      db.photos.toArray(),
      db.sessions.toArray(),
      db.notes.toArray(),
      db.reminders.toArray(),
      db.settings.toArray(),
    ]);

  const photosEncoded = await Promise.all(
    photos.map(async (p) => ({ ...p, blob: undefined, blobBase64: await blobToBase64(p.blob), blobType: p.blob.type })),
  );

  const patternsEncoded = await Promise.all(
    patterns.map(async (p) => ({
      ...p,
      photoBlob: undefined,
      photoBlobBase64: p.photoBlob ? await blobToBase64(p.photoBlob) : undefined,
      photoBlobType: p.photoBlob?.type,
    })),
  );

  const payload = {
    version: 1,
    exportedAt: Date.now(),
    data: {
      projects,
      rowHistory,
      repeats,
      patterns: patternsEncoded,
      yarns,
      photos: photosEncoded,
      sessions,
      notes,
      reminders,
      settings,
    },
  };

  return new Blob([JSON.stringify(payload)], { type: "application/json" });
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text);
  const data = payload.data;

  await db.transaction(
    "rw",
    [
      db.projects,
      db.rowHistory,
      db.repeats,
      db.patterns,
      db.yarns,
      db.photos,
      db.sessions,
      db.notes,
      db.reminders,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.rowHistory.clear(),
        db.repeats.clear(),
        db.patterns.clear(),
        db.yarns.clear(),
        db.photos.clear(),
        db.sessions.clear(),
        db.notes.clear(),
        db.reminders.clear(),
        db.settings.clear(),
      ]);

      await db.projects.bulkAdd(data.projects ?? []);
      await db.rowHistory.bulkAdd(data.rowHistory ?? []);
      await db.repeats.bulkAdd(data.repeats ?? []);
      await db.yarns.bulkAdd(data.yarns ?? []);
      await db.sessions.bulkAdd(data.sessions ?? []);
      await db.notes.bulkAdd(data.notes ?? []);
      await db.reminders.bulkAdd(data.reminders ?? []);
      await db.settings.bulkAdd(data.settings ?? []);

      const patterns = (data.patterns ?? []).map((p: Record<string, unknown>) => {
        const { photoBlobBase64, photoBlobType, ...rest } = p;
        return {
          ...rest,
          photoBlob: photoBlobBase64
            ? base64ToBlob(photoBlobBase64 as string, photoBlobType as string)
            : undefined,
        };
      });
      await db.patterns.bulkAdd(patterns);

      const photos = (data.photos ?? []).map((p: Record<string, unknown>) => {
        const { blobBase64, blobType, ...rest } = p;
        return { ...rest, blob: base64ToBlob(blobBase64 as string, blobType as string) };
      });
      await db.photos.bulkAdd(photos);
    },
  );
}
