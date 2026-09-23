export type ProjectStatus = "in_progress" | "completed" | "paused";
export type Technique = "needles" | "crochet";

export interface Project {
  id?: number;
  name: string;
  itemType: string;
  technique: Technique;
  toolSize?: string;
  startDate: string;
  status: ProjectStatus;
  currentRow: number;
  stitchTarget: number | null;
  stitchCurrent: number;
  autoResetStitches: boolean;
  coverPhotoId?: number;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number | null;
  completedAt?: number | null;
}

export type RowAction = "increment" | "decrement" | "set" | "reset";

export interface RowHistoryEntry {
  id?: number;
  projectId: number;
  row: number;
  action: RowAction;
  timestamp: number;
}

export interface Repeat {
  id?: number;
  projectId: number;
  name: string;
  length: number;
  startRow: number;
}

export interface Pattern {
  id?: number;
  projectId: number | null;
  name: string;
  instructions: string;
  photoBlob?: Blob;
  notes?: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface Yarn {
  id?: number;
  projectId: number;
  name: string;
  manufacturer: string;
  color: string;
  dyeLot: string;
  skeinsTotal: number;
  skeinsUsed: number;
  gramsPerSkein?: number;
  metersPerSkein?: number;
  createdAt: number;
}

export interface Photo {
  id?: number;
  projectId: number;
  blob: Blob;
  row: number | null;
  date: number;
  caption?: string;
}

export interface SessionRecord {
  id?: number;
  projectId: number;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  rowsAtStart: number;
  rowsAtEnd: number;
}

export interface Note {
  id?: number;
  projectId: number;
  row: number | null;
  text: string;
  important: boolean;
  createdAt: number;
}

export interface Reminder {
  id?: number;
  enabled: boolean;
  intervalHours: number;
  message: string;
  lastFiredAt?: number;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

export const PROJECT_TYPES = [
  "Свитер",
  "Носки",
  "Шарф",
  "Шапка",
  "Кардиган",
  "Плед",
  "Варежки",
  "Топ",
  "Игрушка",
  "Другое",
] as const;
