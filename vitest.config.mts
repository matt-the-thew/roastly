import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["./**/*.{ts,tsx}"],
      exclude: ["node_modules/", "app/", ".next/", ".claude/"],
    },
    globals: true,
    // happy dom is faster but sacrifices accuracy and depth
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
