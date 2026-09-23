import type { ReactNode } from "react";

export default function StatTile({
  value,
  label,
  accent = "terracotta",
}: {
  value: ReactNode;
  label: string;
  accent?: "terracotta" | "sage" | "mustard";
}) {
  const color =
    accent === "sage" ? "text-sage-600" : accent === "mustard" ? "text-mustard-600" : "text-terracotta-600";
  return (
    <div className="card p-3 text-center">
      <p className={`text-2xl ${color} section-title`}>{value}</p>
      <p className="text-[11px] text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}
