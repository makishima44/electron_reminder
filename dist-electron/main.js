import { app, BrowserWindow, ipcMain } from "electron";
import { randomUUID } from "node:crypto";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const reminders = [];
const timers = new Map();
const dueQueue = [];
const rendererDistPath = path.join(app.getAppPath(), "dist");
let mainWindow = null;
let reminderWindow = null;
let activeReminderId = null;
const isDev = !app.isPackaged;
const getMainUrl = () => {
    if (isDev) {
        return "http://localhost:5173";
    }
    return `file://${path.join(rendererDistPath, "index.html")}`;
};
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 640,
        minWidth: 600,
        minHeight: 520,
        title: "Reminder",
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
        },
    });
    if (isDev) {
        mainWindow.loadURL(getMainUrl());
    }
    else {
        mainWindow.loadFile(path.join(rendererDistPath, "index.html"));
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};
const openBlockingReminderWindow = (reminder) => {
    if (reminderWindow) {
        return;
    }
    activeReminderId = reminder.id;
    reminderWindow = new BrowserWindow({
        frame: false,
        fullscreen: true,
        kiosk: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
        },
    });
    reminderWindow.setAlwaysOnTop(true, "screen-saver");
    reminderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    const url = isDev
        ? `http://localhost:5173/reminder.html?text=${encodeURIComponent(reminder.text)}&id=${encodeURIComponent(reminder.id)}`
        : `file://${path.join(rendererDistPath, "reminder.html")}?text=${encodeURIComponent(reminder.text)}&id=${encodeURIComponent(reminder.id)}`;
    reminderWindow.loadURL(url);
    reminderWindow.on("blur", () => {
        reminderWindow?.focus();
    });
    reminderWindow.on("closed", () => {
        reminderWindow = null;
        activeReminderId = null;
        showNextReminder();
    });
};
const showNextReminder = () => {
    if (reminderWindow || dueQueue.length === 0) {
        return;
    }
    const next = dueQueue.shift();
    if (!next) {
        return;
    }
    openBlockingReminderWindow(next);
};
const scheduleReminder = (reminder) => {
    const delayMs = Math.max(1000, reminder.triggerAt - Date.now());
    const timer = setTimeout(() => {
        timers.delete(reminder.id);
        const index = reminders.findIndex((item) => item.id === reminder.id);
        if (index !== -1) {
            const [expired] = reminders.splice(index, 1);
            dueQueue.push(expired);
            showNextReminder();
        }
    }, delayMs);
    timers.set(reminder.id, timer);
};
app.whenReady().then(() => {
    createMainWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
ipcMain.handle("get-reminders", () => {
    return reminders
        .slice()
        .sort((a, b) => a.triggerAt - b.triggerAt)
        .map((item) => ({
        id: item.id,
        text: item.text,
        delayMinutes: item.delayMinutes,
        triggerAt: item.triggerAt,
    }));
});
ipcMain.handle("create-reminder", (_event, payload) => {
    const text = payload?.text?.trim();
    const delayMinutes = Number(payload?.delayMinutes);
    if (!text) {
        throw new Error("Reminder text is required");
    }
    if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
        throw new Error("Delay must be greater than zero");
    }
    const reminder = {
        id: randomUUID(),
        text,
        delayMinutes,
        triggerAt: Date.now() + delayMinutes * 60_000,
    };
    reminders.push(reminder);
    scheduleReminder(reminder);
    return reminder;
});
ipcMain.handle("delete-reminder", (_event, id) => {
    const index = reminders.findIndex((item) => item.id === id);
    if (index === -1) {
        return false;
    }
    const [removed] = reminders.splice(index, 1);
    const timer = timers.get(removed.id);
    if (timer) {
        clearTimeout(timer);
        timers.delete(removed.id);
    }
    return true;
});
ipcMain.handle("acknowledge-reminder", (_event, id) => {
    if (activeReminderId !== id) {
        return false;
    }
    activeReminderId = null;
    reminderWindow?.destroy();
    reminderWindow = null;
    showNextReminder();
    return true;
});
//# sourceMappingURL=main.js.map