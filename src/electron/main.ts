import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Reminder } from "../shared/types.js";
import { registerReminderIpc } from "./ipc.js";
import { ReminderService } from "./reminder-service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const rendererPath = path.join(app.getAppPath(), "dist");
const pendingReminders: Reminder[] = [];

let mainWindow: BrowserWindow | null = null;
let reminderWindow: BrowserWindow | null = null;
let activeReminderId: string | null = null;
let reminderService: ReminderService;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 790,
    minWidth: 760,
    minHeight: 680,
    autoHideMenuBar: true,
    title: "Reminder — напоминает о важном",
    backgroundColor: "#f6f5f1",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    void mainWindow.loadURL("http://localhost:5173");
  } else {
    void mainWindow.loadFile(path.join(rendererPath, "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const openReminderWindow = (reminder: Reminder) => {
  if (reminderWindow) {
    pendingReminders.push(reminder);
    return;
  }

  activeReminderId = reminder.id;
  const settings = reminderService.getSettings();
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
    backgroundColor: settings.alertBackground,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  reminderWindow.setAlwaysOnTop(true, "screen-saver");
  reminderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  reminderWindow.setMenuBarVisibility(false);

  const query = new URLSearchParams({
    id: reminder.id,
    text: reminder.text,
    background: settings.alertBackground,
  }).toString();

  if (isDev) {
    void reminderWindow.loadURL("http://localhost:5173/reminder.html?" + query);
  } else {
    void reminderWindow.loadFile(path.join(rendererPath, "reminder.html"), {
      query: { id: reminder.id, text: reminder.text, background: settings.alertBackground },
    });
  }

  reminderWindow.on("blur", () => {
    reminderWindow?.focus();
  });

  reminderWindow.on("closed", () => {
    reminderWindow = null;
    activeReminderId = null;
    const next = pendingReminders.shift();
    if (next) {
      openReminderWindow(next);
    }
  });
};

app.whenReady().then(() => {
  app.setAppUserModelId("com.local.electron-reminder");
  reminderService = new ReminderService();
  registerReminderIpc(reminderService);

  ipcMain.handle("acknowledge-reminder", (_event, id: string) => {
    if (id !== activeReminderId || !reminderWindow) {
      return false;
    }
    reminderWindow.destroy();
    return true;
  });

  createMainWindow();
  reminderService.start(openReminderWindow);

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
