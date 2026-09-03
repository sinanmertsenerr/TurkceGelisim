import js from "@eslint/js";
import globals from "globals";

const strictRules = {
  eqeqeq: ["error", "always", { null: "ignore" }],
  "no-var": "error",
  "prefer-const": "error",
  "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
  "object-shorthand": "error",
  "no-implicit-coercion": "error",
  "no-else-return": ["error", { allowElseIf: false }],
  "no-param-reassign": ["error", { props: false }],
};

export default [
  { ignores: ["node_modules/", ".history/", "docs/", "design.html"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: strictRules,
  },
  {
    files: ["app.js", "core.js", "questions.js", "ui/**/*.js", "data/**/*.js"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["test/**/*.{js,mjs}", "eslint.config.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
