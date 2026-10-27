import Store from "electron-store";
import { getNextOccurrence } from "../shared/schedule.js";
import type {
  AppSettings,
  CreateReminderInput,
  Reminder,
  RepeatRule,
} from "../shared/types.js";

interface PersistedData {
  reminders: Reminder[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = { alertBackground: "#dcebd8" };
const MAX_TIMEOUT_MS = 2_147_000_000;
const REPEAT_RULES: RepeatRule[] = ["none", "daily", "weekdays", "weekly", "monthly"];

export class ReminderService {
  private readonly store = new Store<PersistedData>({
    name: "reminder-data",
    defaults: { reminders: [], settings: DEFAULT_SETTINGS },
  });

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private onDue: ((reminder: Reminder) => void) | null = null;

  getReminders() {
    return this.store.get("reminders").slice().sort((a, b) => a.triggerAt - b.triggerAt);
  }

  getSettings() {
    return this.store.get("settings");
  }

  start(onDue: (reminder: Reminder) => void) {
    this.onDue = onDue;
    for (const reminder of this.getReminders()) {
      this.schedule(reminder);
    }
  }

  createReminder(input: CreateReminderInput) {
    const text = input?.text?.trim();
    const triggerAt = Number(input?.triggerAt);
    const repeat = input?.repeat;

    if (!text) {
      throw new Error("Введите текст напоминания.");
    }
    if (!Number.isFinite(triggerAt) || triggerAt <= Date.now()) {
      throw new Error("Выберите дату и время в будущем.");
    }
    if (!REPEAT_RULES.includes(repeat)) {
      throw new Error("Выберите допустимый вариант повтора.");
    }

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text,
      triggerAt,
      anchorAt: triggerAt,
      repeat,
    };

    this.saveReminders([...this.getReminders(), reminder]);
    this.schedule(reminder);
    return reminder;
  }

  deleteReminder(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const next = this.getReminders().filter((reminder) => reminder.id !== id);
    const changed = next.length !== this.getReminders().length;
    if (changed) {
      this.saveReminders(next);
    }
    return changed;
  }

  updateSettings(settings: AppSettings) {
    if (!/^#[\da-f]{6}$/i.test(settings?.alertBackground ?? "")) {
      throw new Error("Выберите корректный цвет фона.");
    }

    const nextSettings = { alertBackground: settings.alertBackground.toLowerCase() };
    this.store.set("settings", nextSettings);
    return nextSettings;
  }

  private saveReminders(reminders: Reminder[]) {
    this.store.set("reminders", reminders);
  }

  private schedule(reminder: Reminder) {
    const existing = this.timers.get(reminder.id);
    if (existing) {
      clearTimeout(existing);
    }

    const remaining = reminder.triggerAt - Date.now();
    const timer = setTimeout(() => {
      if (remaining > MAX_TIMEOUT_MS) {
        this.schedule(reminder);
        return;
      }

      this.timers.delete(reminder.id);
      const stored = this.getReminders().find((item) => item.id === reminder.id);
      if (!stored) {
        return;
      }

      const dueReminder = { ...stored };
      if (stored.repeat === "none") {
        this.saveReminders(this.getReminders().filter((item) => item.id !== stored.id));
      } else {
        stored.triggerAt = getNextOccurrence(
          stored.anchorAt,
          stored.repeat,
          Math.max(Date.now(), reminder.triggerAt),
        );
        this.saveReminders(
          this.getReminders().map((item) => (item.id === stored.id ? stored : item)),
        );
        this.schedule(stored);
      }

      this.onDue?.(dueReminder);
    }, Math.min(Math.max(remaining, 0), MAX_TIMEOUT_MS));

    this.timers.set(reminder.id, timer);
  }
}
