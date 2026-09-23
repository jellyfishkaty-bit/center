import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useObjectUrl } from "../hooks/useObjectUrl";

export interface PatternFormValues {
  name: string;
  instructions: string;
  notes: string;
  isFavorite: boolean;
  photoBlob?: Blob;
}

export default function PatternForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<PatternFormValues>;
  onSave: (values: PatternFormValues) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isFavorite, setIsFavorite] = useState(initial?.isFavorite ?? false);
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(initial?.photoBlob);
  const photoUrl = useObjectUrl(photoBlob);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="card p-5 w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-b-none sm:rounded-b-xl2">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title text-lg">Узор</p>
          <button onClick={onClose}>
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        <label className="label">Название узора</label>
        <input
          className="input-field mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, коса 6х6"
          autoFocus
        />

        <label className="label">Пошаговая инструкция по рядам</label>
        <textarea
          className="input-field mb-3 min-h-24"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ряд 1: лиц. Ряд 2: изн. ..."
        />

        <label className="label">Фото схемы</label>
        <label className="card border border-dashed border-cream-300 flex items-center justify-center h-28 mb-3 cursor-pointer overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-ink-500 text-sm flex items-center gap-1.5">
              <ImageIcon size={18} /> Добавить фото
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhotoBlob(file);
            }}
          />
        </label>

        <label className="label">Заметки</label>
        <textarea
          className="input-field mb-3 min-h-16"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Например, чётные ряды — изнаночные"
        />

        <label className="flex items-center gap-2 text-sm text-ink-700 mb-4">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
          />
          Добавить в избранное (для использования в других проектах)
        </label>

        <button
          className="btn-primary w-full py-3"
          onClick={() => {
            if (!name.trim()) return;
            onSave({ name: name.trim(), instructions, notes, isFavorite, photoBlob });
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
