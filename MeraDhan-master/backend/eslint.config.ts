import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["databases/**/*", "emails/**/*"], "Ignore Build Directory"),
  {
    files: ["./src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
  {
    files: ["./main.ts","./start.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration",
          message: "Exporting is not allowed in this file",
        },
        {
          selector: "ExportDefaultDeclaration",
          message: "Default export is not allowed in this file",
        },
      ],
    },
  },
]);
