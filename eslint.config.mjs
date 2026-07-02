import globals from "globals";
import tseslint from "typescript-eslint";

import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules/**", ".next/**", "playwright-report/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": "off",
      "no-debugger": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name=/^(createClient|createBrowserClient|createServerClient)$/]:not(:function *)",
          message:
            "Don't construct a Supabase client outside a function body (module scope or class field initializer). Next.js evaluates route modules during build-time page data collection, before env vars are guaranteed to be available — eager construction breaks the Vercel build. Wrap it in a function/getter instead.",
        },
      ],
    },
  },
]);
