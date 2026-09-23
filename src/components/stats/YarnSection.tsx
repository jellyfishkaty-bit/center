import { useMemo } from "react";
import type { Project, Yarn } from "../../db/types";
import { avgYarnPerItemType, yarnByManufacturer, yarnTotals } from "../../db/statsUtils";

export default function YarnSection({ yarns, projects }: { yarns: Yarn[]; projects: Project[] }) {
  const totals = useMemo(() => yarnTotals(yarns), [yarns]);
  const byManufacturer = useMemo(() => yarnByManufacturer(yarns), [yarns]);
  const perItemType = useMemo(() => avgYarnPerItemType(yarns, projects), [yarns, projects]);
  const maxManufacturer = Math.max(1, ...byManufacturer.map((m) => m.skeins));

  if (yarns.length === 0) {
    return (
      <section className="card p-4">
        <p className="section-title text-lg mb-1">Пряжа</p>
        <p className="text-sm text-ink-500">
          Добавьте пряжу в проектах — здесь появится сводная статистика расхода.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <p className="section-title text-lg mb-3">Пряжа</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-cream-100/70 p-2.5 text-center">
          <p className="text-xl text-terracotta-600 section-title">{totals.skeins}</p>
          <p className="text-[10px] text-ink-500">мотков всего</p>
        </div>
        <div className="rounded-xl bg-cream-100/70 p-2.5 text-center">
          <p className="text-xl text-terracotta-600 section-title">
            {totals.grams > 0 ? Math.round(totals.grams) : "—"}
          </p>
          <p className="text-[10px] text-ink-500">граммов</p>
        </div>
        <div className="rounded-xl bg-cream-100/70 p-2.5 text-center">
          <p className="text-xl text-terracotta-600 section-title">
            {totals.meters > 0 ? Math.round(totals.meters) : "—"}
          </p>
          <p className="text-[10px] text-ink-500">метров</p>
        </div>
      </div>

      {byManufacturer.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-ink-500 mb-2">Самые используемые производители</p>
          <div className="flex flex-col gap-1.5">
            {byManufacturer.map((m) => (
              <div key={m.manufacturer} className="flex items-center gap-2">
                <span className="text-xs text-ink-700 w-24 truncate shrink-0">{m.manufacturer}</span>
                <div className="flex-1 h-3 bg-cream-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-500 rounded-full"
                    style={{ width: `${(m.skeins / maxManufacturer) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ink-500 w-14 text-right shrink-0">{m.skeins} мот.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {perItemType.length > 0 && (
        <div>
          <p className="text-xs text-ink-500 mb-2">Средний расход по типу изделия</p>
          <div className="flex flex-col gap-1.5">
            {perItemType.map((t) => (
              <div key={t.itemType} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{t.itemType}</span>
                <span className="text-ink-500">
                  ≈ {t.avgGrams} г{t.projectCount > 1 ? ` (${t.projectCount} проекта)` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
