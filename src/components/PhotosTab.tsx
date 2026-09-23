import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, Star, Trash2, X, GitCompare } from "lucide-react";
import { db } from "../db/db";
import type { Photo, Project } from "../db/types";
import { useObjectUrl } from "../hooks/useObjectUrl";

function PhotoThumb({
  photo,
  project,
  selected,
  onToggleSelect,
}: {
  photo: Photo;
  project: Project;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const url = useObjectUrl(photo.blob);
  const isCover = project.coverPhotoId === photo.id;

  return (
    <div className={`card overflow-hidden ${selected ? "ring-2 ring-terracotta-400" : ""}`}>
      <button className="w-full aspect-square block" onClick={onToggleSelect}>
        {url && <img src={url} alt="" className="w-full h-full object-cover" />}
      </button>
      <div className="p-2 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-ink-500 truncate">
            {new Date(photo.date).toLocaleDateString("ru-RU")}
            {photo.row !== null && ` · ряд ${photo.row}`}
          </p>
          {photo.caption && (
            <p className="text-xs text-ink-700 truncate">{photo.caption}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() =>
              db.projects.update(project.id!, {
                coverPhotoId: isCover ? undefined : photo.id,
              })
            }
            className="tap-target"
            aria-label="Сделать обложкой"
          >
            <Star
              size={15}
              className={isCover ? "fill-terracotta-400 text-terracotta-400" : "text-ink-500/40"}
            />
          </button>
          <button
            onClick={() => db.photos.delete(photo.id!)}
            className="tap-target text-ink-500/40 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareView({
  a,
  b,
  onClose,
}: {
  a: Photo;
  b: Photo;
  onClose: () => void;
}) {
  const urlA = useObjectUrl(a.blob);
  const urlB = useObjectUrl(b.blob);
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      <div className="flex justify-end p-3">
        <button onClick={onClose} className="text-white tap-target">
          <X size={26} />
        </button>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-1 px-1">
        <div className="flex flex-col">
          {urlA && <img src={urlA} alt="" className="w-full h-full object-contain" />}
          <p className="text-white text-center text-xs py-2">
            {new Date(a.date).toLocaleDateString("ru-RU")}
            {a.row !== null && ` · ряд ${a.row}`}
          </p>
        </div>
        <div className="flex flex-col">
          {urlB && <img src={urlB} alt="" className="w-full h-full object-contain" />}
          <p className="text-white text-center text-xs py-2">
            {new Date(b.date).toLocaleDateString("ru-RU")}
            {b.row !== null && ` · ряд ${b.row}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PhotosTab({ project }: { project: Project }) {
  const [showAdd, setShowAdd] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [row, setRow] = useState(String(project.currentRow));
  const [selected, setSelected] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);

  const photos = useLiveQuery(
    () =>
      db.photos
        .where("projectId")
        .equals(project.id!)
        .reverse()
        .sortBy("date"),
    [project.id],
  );

  const pendingUrl = useObjectUrl(pendingFile ?? undefined);

  async function save() {
    if (!pendingFile) return;
    await db.photos.add({
      projectId: project.id!,
      blob: pendingFile,
      row: row ? Number(row) : null,
      date: Date.now(),
      caption: caption.trim() || undefined,
    });
    setShowAdd(false);
    setPendingFile(null);
    setCaption("");
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const photoA = photos?.find((p) => p.id === selected[0]);
  const photoB = photos?.find((p) => p.id === selected[1]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setRow(String(project.currentRow));
            setShowAdd(true);
          }}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
        >
          <Camera size={18} /> Добавить фото
        </button>
        {selected.length === 2 && (
          <button
            onClick={() => setComparing(true)}
            className="btn-secondary px-4 flex items-center gap-1.5"
          >
            <GitCompare size={16} /> Сравнить
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-ink-500 mb-2">
          Выбрано фото: {selected.length}/2 для сравнения
        </p>
      )}

      {photos?.length === 0 && (
        <p className="text-center text-ink-500 text-sm py-6">
          Пока нет фото. Сфотографируйте прогресс, чтобы увидеть ленту изменений.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {photos?.map((photo) => (
          <PhotoThumb
            key={photo.id}
            photo={photo}
            project={project}
            selected={selected.includes(photo.id!)}
            onToggleSelect={() => toggleSelect(photo.id!)}
          />
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="card p-5 w-full sm:max-w-sm rounded-b-none sm:rounded-b-xl2">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink-900">Новое фото</p>
              <button onClick={() => setShowAdd(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>

            <label className="card border border-dashed border-cream-300 flex items-center justify-center h-40 mb-3 cursor-pointer overflow-hidden">
              {pendingUrl ? (
                <img src={pendingUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-ink-500 text-sm flex items-center gap-1.5">
                  <Camera size={20} /> Выбрать или сделать фото
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <label className="label">Привязать к ряду</label>
            <input
              type="number"
              className="input-field mb-3"
              value={row}
              onChange={(e) => setRow(e.target.value)}
            />

            <label className="label">Подпись</label>
            <input
              className="input-field mb-4"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Например, закончила спинку"
            />

            <button
              className="btn-primary w-full py-3 disabled:opacity-40"
              disabled={!pendingFile}
              onClick={save}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {comparing && photoA && photoB && (
        <CompareView a={photoA} b={photoB} onClose={() => setComparing(false)} />
      )}
    </div>
  );
}
