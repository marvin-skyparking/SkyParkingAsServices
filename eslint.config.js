const typescriptEslintParser = require('@typescript-eslint/parser');

const config = [
  {
    files: ["**/*.ts", "**/*.tsx"], // TypeScript files
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...require("globals").browser,
        ...require("globals").node,
      },
      parser: typescriptEslintParser,
    },
    plugins: {
      react: require("eslint-plugin-react"),
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      // prettier: require("eslint-plugin-prettier"), // Remove this if not needed
    },
    rules: {
      // 'prettier/prettier': 'error', // Remove or comment out this rule
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"], // JavaScript files
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...require("globals").browser,
        ...require("globals").node,
      },
    },
    plugins: {
      react: require("eslint-plugin-react"),
      // prettier: require("eslint-plugin-prettier"), // Remove this if not needed
    },
    rules: {
      // 'prettier/prettier': 'error', // Remove or comment out this rule
    },
  },
];

module.exports = config;
