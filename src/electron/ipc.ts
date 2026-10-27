import { ipcMain } from "electron";
import type { AppSettings, CreateReminderInput } from "../shared/types.js";
import { ReminderService } from "./reminder-service.js";

export const registerReminderIpc = (service: ReminderService) => {
  ipcMain.handle("get-reminders", () => service.getReminders());
  ipcMain.handle("create-reminder", (_event, input: CreateReminderInput) =>
    service.createReminder(input),
  );
  ipcMain.handle("delete-reminder", (_event, id: string) =>
    service.deleteReminder(id),
  );
  ipcMain.handle("get-settings", () => service.getSettings());
  ipcMain.handle("update-settings", (_event, settings: AppSettings) =>
    service.updateSettings(settings),
  );
};
