/// <reference types="vite/client" />

type Reminder = {
  id: string;
  text: string;
  delayMinutes: number;
  triggerAt: number;
};

interface ReminderAPI {
  getReminders: () => Promise<Reminder[]>;
  createReminder: (payload: { text: string; delayMinutes: number }) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<boolean>;
  acknowledgeReminder: (id: string) => Promise<boolean>;
}

interface Window {
  reminderAPI: ReminderAPI;
}
