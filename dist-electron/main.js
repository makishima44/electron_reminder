import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import Store from "electron-store";
// 2. Создаём хранилище с типизацией
const store = new Store();
// 3. Эмулируем __dirname (обязательно при использовании import в ES-модулях)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 4. Создаём окно
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true, // важно для безопасности
        },
    });
    win.loadURL("http://localhost:5173");
    // win.webContents.openDevTools(); // раскомментируй для отладки
};
// 5. Запуск приложения
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});
// 6. IPC-обработчики
ipcMain.handle("get-reminders", () => {
    return store.get("reminders", []);
});
ipcMain.handle("add-reminder", (_event, text) => {
    const reminders = store.get("reminders", []);
    reminders.push(text);
    store.set("reminders", reminders);
});
ipcMain.handle("delete-reminder", (_event, index) => {
    const reminders = store.get("reminders", []);
    reminders.splice(index, 1);
    store.set("reminders", reminders);
});
//# sourceMappingURL=main.js.map