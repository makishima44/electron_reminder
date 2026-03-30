"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("reminderAPI", {
    getReminders: () => electron_1.ipcRenderer.invoke("get-reminders"),
    createReminder: (payload) => electron_1.ipcRenderer.invoke("create-reminder", payload),
    deleteReminder: (id) => electron_1.ipcRenderer.invoke("delete-reminder", id),
    acknowledgeReminder: (id) => electron_1.ipcRenderer.invoke("acknowledge-reminder", id),
});
//# sourceMappingURL=preload.cjs.map