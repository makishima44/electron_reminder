import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true, // чтобы был доступен по локальной сети
    port: 5173, // фиксируем порт
  },
});
