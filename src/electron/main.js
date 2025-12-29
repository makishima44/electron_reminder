"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_store_1 = __importDefault(require("electron-store"));
// 2. Создаём хранилище с типизацией
const store = new electron_store_1.default();
// 3. Эмулируем __dirname (обязательно при использовании import в ES-модулях)
const url_1 = require("url");
const path_2 = require("path");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_2.dirname)(__filename);
// 4. Создаём окно
const createWindow = () => {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true, // важно для безопасности
        },
    });
    win.loadURL("http://localhost:5173");
    // win.webContents.openDevTools(); // раскомментируй для отладки
};
// 5. Запуск приложения
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
// 6. IPC-обработчики
electron_1.ipcMain.handle("get-reminders", () => {
    return store.get("reminders", []);
});
electron_1.ipcMain.handle("add-reminder", (_event, text) => {
    const reminders = store.get("reminders", []);
    reminders.push(text);
    store.set("reminders", reminders);
});
electron_1.ipcMain.handle("delete-reminder", (_event, index) => {
    const reminders = store.get("reminders", []);
    reminders.splice(index, 1);
    store.set("reminders", reminders);
});
//# sourceMappingURL=main.js.map