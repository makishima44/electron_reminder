/// <reference types="vite/client" />

import type { ReminderAPI } from "./shared/types";

interface Window {
  reminderAPI: ReminderAPI;
}
