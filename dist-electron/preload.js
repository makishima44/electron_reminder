import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("reminderAPI", {
    getReminders: () => ipcRenderer.invoke("get-reminders"),
    addReminder: (text) => ipcRenderer.invoke("add-reminder", text),
    deleteReminder: (index) => ipcRenderer.invoke("delete-reminder", index),
});
//# sourceMappingURL=preload.js.map