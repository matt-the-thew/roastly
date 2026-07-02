import path from "node:path";
import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const emptyStub = path.resolve(import.meta.dirname, "./__mocks__/empty.ts");

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // Next.js runtime guards throw when imported outside their target
      // bundle. Stub them so server-action / client modules can be unit tested.
      "server-only": emptyStub,
      "client-only": emptyStub,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    // happy dom is faster but sacrifices accuracy and depth
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
    // Vitest only runs unit/integration specs. Playwright owns tests/e2e —
    // those import @playwright/test and must never be collected here (their
    // filenames also match Vitest's default *.test.ts glob).
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    coverage: {
      provider: "v8",
      // With `include` set, Vitest 4 reports every matching source file even
      // if it has no test yet, so the denominator reflects the real codebase
      // instead of only-imported files. That's what makes the % meaningful.
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      // The denominator: business logic we actually intend to unit test.
      include: [
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "app/actions/**/*.{ts,tsx}",
      ],
      exclude: [
        // One-off data-seeding script (top-level await + real DB writes),
        // not part of the app runtime.
        "lib/bootstrapData.ts",
        // Thin server-only client factories — no branching logic, and they
        // require a real server context / service-role secrets to exercise.
        "lib/supabase/server.ts",
        "lib/supabase/serviceRoleClient.ts",
        // Always globally mocked in vitest.setup.ts, so the real factory body
        // never executes under test — excluding keeps the denominator honest.
        "lib/supabase/client.ts",
        // Mapbox GL / WebGL rendering can't run in jsdom; the map surface is
        // exercised by Playwright e2e, not unit tests.
        "components/Map/**",
        "**/*.d.ts",
      ],
      // Ratchet to guard against regressions. Set just below the achieved
      // numbers (lines/statements ~99-100%, functions 100%, branches ~96% —
      // the residual branches are provably-unreachable defensive code). New
      // untested code trips these; raise them as coverage climbs.
      thresholds: {
        statements: 98,
        branches: 93,
        functions: 100,
        lines: 98,
      },
    },
  },
});
