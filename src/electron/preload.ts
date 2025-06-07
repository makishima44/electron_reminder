import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("reminderAPI", {
  getReminders: () => ipcRenderer.invoke("get-reminders"),
  addReminder: (text: string) => ipcRenderer.invoke("add-reminder", text),
  deleteReminder: (index: number) => ipcRenderer.invoke("delete-reminder", index),
});
