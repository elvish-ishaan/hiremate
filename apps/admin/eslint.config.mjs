import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  nextPlugin.flatConfig.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
