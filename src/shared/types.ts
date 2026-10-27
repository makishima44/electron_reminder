export type RepeatRule = "none" | "daily" | "weekdays" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  text: string;
  triggerAt: number;
  anchorAt: number;
  repeat: RepeatRule;
}

export interface CreateReminderInput {
  text: string;
  triggerAt: number;
  repeat: RepeatRule;
}

export interface AppSettings {
  alertBackground: string;
}

export interface ReminderAPI {
  getReminders(): Promise<Reminder[]>;
  createReminder(input: CreateReminderInput): Promise<Reminder>;
  deleteReminder(id: string): Promise<boolean>;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<AppSettings>;
  acknowledgeReminder(id: string): Promise<boolean>;
}
