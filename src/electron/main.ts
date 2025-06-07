import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import Store from "electron-store";

const store = new Store();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:5173");
};

// Когда Electron готов — создаём окно
app.whenReady().then(createWindow);

// IPC: Получение всех напоминаний
ipcMain.handle("get-reminders", () => {
  return store.get("reminders", []) as string[];
});

// IPC: Добавление напоминания
ipcMain.handle("add-reminder", (_event, text: string) => {
  const reminders = store.get("reminders", []) as string[];
  reminders.push(text);
  store.set("reminders", reminders);
});

// IPC: Удаление напоминания
ipcMain.handle("delete-reminder", (_event, index: number) => {
  const reminders = store.get("reminders", []) as string[];
  reminders.splice(index, 1);
  store.set("reminders", reminders);
});
