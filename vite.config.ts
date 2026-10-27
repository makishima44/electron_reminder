import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true, // чтобы был доступен по локальной сети
    port: 5173, // фиксируем порт
  },
  build: {
    rollupOptions: {
      input: [resolve(projectRoot, "index.html"), resolve(projectRoot, "reminder.html")],
    },
  },
});
