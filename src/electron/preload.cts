import { contextBridge, ipcRenderer } from "electron";
import type { AppSettings, CreateReminderInput } from "../shared/types.js" with {
  "resolution-mode": "import",
};

contextBridge.exposeInMainWorld("reminderAPI", {
  getReminders: () => ipcRenderer.invoke("get-reminders"),
  createReminder: (input: CreateReminderInput) => ipcRenderer.invoke("create-reminder", input),
  deleteReminder: (id: string) => ipcRenderer.invoke("delete-reminder", id),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  updateSettings: (settings: AppSettings) => ipcRenderer.invoke("update-settings", settings),
  acknowledgeReminder: (id: string) => ipcRenderer.invoke("acknowledge-reminder", id),
});
