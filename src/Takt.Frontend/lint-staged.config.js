module.exports = {
  '**/*.{ts,html}': (files) => [
    `node_modules/.bin/prettier --write ${files.map((f) => `"${f}"`).join(' ')}`,
    `node_modules/.bin/eslint --fix ${files.map((f) => `"${f}"`).join(' ')}`,
  ],
  '**/*.{css,json}': (files) => [
    `node_modules/.bin/prettier --write ${files.map((f) => `"${f}"`).join(' ')}`,
  ],
};
