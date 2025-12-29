"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("reminderAPI", {
    getReminders: () => electron_1.ipcRenderer.invoke("get-reminders"),
    addReminder: (text) => electron_1.ipcRenderer.invoke("add-reminder", text),
    deleteReminder: (index) => electron_1.ipcRenderer.invoke("delete-reminder", index),
});
//# sourceMappingURL=preload.js.map