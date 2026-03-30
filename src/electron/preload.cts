import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("reminderAPI", {
  getReminders: () => ipcRenderer.invoke("get-reminders"),
  createReminder: (payload: { text: string; delayMinutes: number }) =>
    ipcRenderer.invoke("create-reminder", payload),
  deleteReminder: (id: string) => ipcRenderer.invoke("delete-reminder", id),
  acknowledgeReminder: (id: string) => ipcRenderer.invoke("acknowledge-reminder", id),
});
