import { useMemo } from "react";

const WEEKS = 14;

function levelColor(count: number): string {
  if (count === 0) return "#f3e6d3";
  if (count <= 2) return "#c5d3b1";
  if (count <= 5) return "#8fa96f";
  if (count <= 10) return "#5d7244";
  return "#2f3a23";
}

export default function ActivityHeatmap({ counts }: { counts: Map<string, number> }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = WEEKS * 7;
    const start = new Date(today);
    start.setDate(start.getDate() - totalDays + 1);
    const startWeekday = (start.getDay() + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - startWeekday);

    const list: { date: Date; key: string; count: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      list.push({ date: new Date(cursor), key, count: counts.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return list;
  }, [counts]);

  const weekCount = Math.ceil(days.length / 7);
  const weeks: (typeof days)[] = Array.from({ length: weekCount }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.key}
                title={`${day.date.toLocaleDateString("ru-RU")}: ${day.count} рядов`}
                className="w-3.5 h-3.5 rounded-[3px]"
                style={{ backgroundColor: levelColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-ink-500">
        <span>Меньше</span>
        {[0, 1, 3, 6, 11].map((c) => (
          <div key={c} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: levelColor(c) }} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}
