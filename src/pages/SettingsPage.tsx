import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Bell, Download, Upload, TriangleAlert } from "lucide-react";
import { db } from "../db/db";
import { exportBackup, importBackup } from "../db/backup";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );

  const reminders = useLiveQuery(() => db.reminders.toArray(), []);
  const reminder = reminders?.[0];

  async function ensureReminder() {
    if (reminder) return reminder;
    const id = await db.reminders.add({
      enabled: false,
      intervalHours: 24,
      message: "Не забудь связать сегодня хотя бы 10 рядов!",
    });
    return db.reminders.get(id);
  }

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }

  async function toggleReminder(enabled: boolean) {
    if (enabled && notifPermission !== "granted") {
      await requestPermission();
    }
    const r = await ensureReminder();
    if (r) await db.reminders.update(r.id!, { enabled });
  }

  async function handleExport() {
    const blob = await exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knitting-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    if (!confirm("Импорт заменит все текущие данные приложения резервной копией. Продолжить?")) return;
    setImporting(true);
    try {
      await importBackup(file);
      alert("Данные успешно восстановлены.");
    } catch (e) {
      alert("Не удалось прочитать файл резервной копии.");
      console.error(e);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-ink-900">Настройки</h1>

      <section className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={18} className="text-terracotta-500" />
          <p className="font-semibold text-ink-900">Напоминания</p>
        </div>
        <p className="text-xs text-ink-500 mb-3">
          Локальные уведомления работают, пока приложение открыто (в фоновой вкладке или
          установлено на экран). Разрешите уведомления в браузере, чтобы они приходили.
        </p>

        {notifPermission !== "granted" && (
          <button onClick={requestPermission} className="btn-secondary w-full py-2.5 mb-3 text-sm">
            Разрешить уведомления
          </button>
        )}

        <label className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink-700">Включить напоминания</span>
          <input
            type="checkbox"
            checked={reminder?.enabled ?? false}
            onChange={(e) => toggleReminder(e.target.checked)}
          />
        </label>

        <label className="label">Периодичность (часов)</label>
        <input
          type="number"
          className="input-field mb-3"
          value={reminder?.intervalHours ?? 24}
          min={1}
          onChange={async (e) => {
            const r = await ensureReminder();
            if (r) await db.reminders.update(r.id!, { intervalHours: Number(e.target.value) || 24 });
          }}
        />

        <label className="label">Текст напоминания</label>
        <input
          className="input-field"
          value={reminder?.message ?? "Не забудь связать сегодня хотя бы 10 рядов!"}
          onChange={async (e) => {
            const r = await ensureReminder();
            if (r) await db.reminders.update(r.id!, { message: e.target.value });
          }}
        />
      </section>

      <section className="card p-4">
        <p className="font-semibold text-ink-900 mb-3">Резервное копирование</p>
        <button
          onClick={handleExport}
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2 mb-2"
        >
          <Download size={17} /> Скачать бэкап (JSON)
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload size={17} /> {importing ? "Импорт..." : "Восстановить из файла"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex items-start gap-1.5 mt-3 text-xs text-ink-500">
          <TriangleAlert size={14} className="shrink-0 mt-0.5" />
          <span>Импорт полностью заменяет текущие данные приложения. Все данные хранятся
          только на этом устройстве.</span>
        </div>
      </section>
    </div>
  );
}
