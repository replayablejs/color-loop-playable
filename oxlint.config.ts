import { readFileSync } from 'node:fs';

import { defineConfig } from 'oxlint';

const ignorePatterns = readFileSync(new URL('./.gitignore', import.meta.url), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'));

export default defineConfig({
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  ignorePatterns,
  options: {
    typeAware: true,
  },
  plugins: ['typescript', 'promise', 'node', 'import'],
  rules: {
    curly: 'error',
    // Animation completion callbacks intentionally return void.
    'promise/always-return': 'off',
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
  },
});
