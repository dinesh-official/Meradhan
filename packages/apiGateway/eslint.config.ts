import js from "@eslint/js";
import globals from "globals";
import tslint from "typescript-eslint";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {js},
        extends: ["js/recommended"],
        languageOptions: {globals: {...globals.browser, ...globals.node}}
    },
    tslint.configs.recommended,
]);
