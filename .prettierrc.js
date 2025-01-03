module.exports = {
  endOfLine: "auto",
  printWidth: 120,
  overrides: [
    { files: ["*.js", "*.mjs"], options: { parser: "babel" } },
    { files: "*.md", options: { parser: "markdown", proseWrap: "always" } },
    { files: "*.ts", options: { parser: "typescript", singleQuote: true } },
    { files: "*.json", options: { parser: "json" } },
    { files: ["*.yml", "*.yaml"], options: { parser: "yaml", tabWidth: 2 } },
  ],
};
