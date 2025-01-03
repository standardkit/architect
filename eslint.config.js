const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const eslintPluginPrettier = require("eslint-plugin-prettier");
const eslintPluginImport = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = tseslint.config({
  files: ["**/*.ts"],
  extends: [
    eslint.configs.recommended,
    eslintPluginPrettierRecommended,
    eslintPluginImport.flatConfigs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: __dirname } } },
  ],
  plugins: { "simple-import-sort": simpleImportSort, eslintPluginPrettier, "unused-imports": unusedImports },
  rules: {
    "@typescript-eslint/explicit-function-return-type": ["error"],
    "@typescript-eslint/explicit-member-accessibility": ["error", { overrides: { constructors: "off" } }],
    "@typescript-eslint/no-use-before-define": ["error", { classes: false }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
    "@typescript-eslint/consistent-generic-constructors": "off",
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "enumMember", format: ["PascalCase"] },
      { selector: "function", format: ["PascalCase", "camelCase"] },
      { selector: "typeAlias", format: ["PascalCase"] },
      { selector: "variable", types: ["boolean"], format: ["camelCase"] },
      { selector: "class", format: ["PascalCase"] },
      { selector: "variableLike", format: ["camelCase"], leadingUnderscore: "allow" },
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "forbid",
      },
    ],
    "import/order": ["error", { "newlines-between": "never", alphabetize: { order: "asc", caseInsensitive: false } }],
    "simple-import-sort/exports": "error",
    "max-len": ["error", { code: 120 }],
    "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
    "no-empty-function": ["error", { allow: ["arrowFunctions", "constructors"] }],
    "no-multi-spaces": "error",
    "no-case-declarations": "off",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-trailing-spaces": "error",
    "object-curly-newline": ["error"],
    "comma-dangle": ["error", "always-multiline"],
    "import/no-unresolved": "off",
    "import/named": "off",
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "never", prev: "if", next: "return" },
    ],
    "unused-imports/no-unused-imports": "error",
  },
});
