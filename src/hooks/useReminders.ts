import { useEffect } from "react";
import { db } from "../db/db";

export function useReminders() {
  useEffect(() => {
    const check = async () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const reminders = (await db.reminders.toArray()).filter((r) => r.enabled);
      const now = Date.now();
      for (const reminder of reminders) {
        const intervalMs = reminder.intervalHours * 60 * 60 * 1000;
        const last = reminder.lastFiredAt ?? 0;
        if (now - last >= intervalMs) {
          new Notification("Вязальный дневник", { body: reminder.message });
          await db.reminders.update(reminder.id!, { lastFiredAt: now });
        }
      }
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);
}
