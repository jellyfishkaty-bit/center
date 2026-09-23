import Dexie, { type Table } from "dexie";
import type {
  Note,
  Pattern,
  Photo,
  Project,
  Reminder,
  Repeat,
  RowHistoryEntry,
  SessionRecord,
  SettingsRecord,
  Yarn,
} from "./types";

class KnittingDB extends Dexie {
  projects!: Table<Project, number>;
  rowHistory!: Table<RowHistoryEntry, number>;
  repeats!: Table<Repeat, number>;
  patterns!: Table<Pattern, number>;
  yarns!: Table<Yarn, number>;
  photos!: Table<Photo, number>;
  sessions!: Table<SessionRecord, number>;
  notes!: Table<Note, number>;
  reminders!: Table<Reminder, number>;
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super("knitting-tracker");
    this.version(1).stores({
      projects: "++id, status, createdAt, updatedAt, archivedAt",
      rowHistory: "++id, projectId, timestamp",
      repeats: "++id, projectId",
      patterns: "++id, projectId",
      yarns: "++id, projectId",
      photos: "++id, projectId, date, row",
      sessions: "++id, projectId, startTime",
      notes: "++id, projectId, row",
      reminders: "++id",
      settings: "key",
    });
  }
}

export const db = new KnittingDB();

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const record = await db.settings.get(key);
  return record ? (record.value as T) : fallback;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}
