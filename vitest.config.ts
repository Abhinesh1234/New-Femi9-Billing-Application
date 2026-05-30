import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./resources/js/__tests__/setup.ts"],
    css: false,
    alias: {
      moment: "moment/moment.js",
    },
  },
});
