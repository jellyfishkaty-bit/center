import { useState } from "react";
import { Star, Trash2, Pencil } from "lucide-react";
import { useObjectUrl } from "../hooks/useObjectUrl";
import type { Pattern } from "../db/types";

export default function PatternCard({
  pattern,
  onToggleFavorite,
  onDelete,
  onEdit,
}: {
  pattern: Pattern;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const photoUrl = useObjectUrl(pattern.photoBlob);

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        {photoUrl && (
          <img
            src={photoUrl}
            alt=""
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              className="font-semibold text-ink-900 text-left"
              onClick={() => setExpanded((v) => !v)}
            >
              {pattern.name}
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onToggleFavorite} className="tap-target">
                <Star
                  size={18}
                  className={pattern.isFavorite ? "fill-terracotta-400 text-terracotta-400" : "text-ink-500/40"}
                />
              </button>
              <button onClick={onEdit} className="tap-target text-ink-500/60">
                <Pencil size={16} />
              </button>
              <button onClick={onDelete} className="tap-target text-ink-500/40 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {pattern.notes && (
            <p className="text-xs text-ink-500 mt-0.5 italic">{pattern.notes}</p>
          )}
        </div>
      </div>
      {expanded && pattern.instructions && (
        <p className="text-sm text-ink-700 whitespace-pre-wrap mt-3 pt-3 border-t border-cream-200">
          {pattern.instructions}
        </p>
      )}
    </div>
  );
}
