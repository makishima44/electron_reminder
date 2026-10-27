/// <reference types="vite/client" />

import type { ReminderAPI } from "./shared/types";

declare global {
  interface Window {
    reminderAPI: ReminderAPI;
  }
}

export {};
