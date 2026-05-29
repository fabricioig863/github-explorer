const { defineConfig } = require('eslint/config');
const universeNative = require('eslint-config-universe/flat/native');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  ...universeNative,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'application', pattern: 'src/application/**' },
        // navigation é a composition root: liga screens (presentation) às rotas.
        // Precede 'infrastructure' porque eslint-boundaries casa pelo 1º match.
        { type: 'navigation', pattern: 'src/infra/navigation/**' },
        { type: 'infrastructure', pattern: 'src/infra/**' },
        { type: 'presentation', pattern: 'src/presentation/**' },
      ],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-cycle': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'domain',
              disallow: ['application', 'infrastructure', 'presentation'],
            },
            {
              from: 'application',
              disallow: ['infrastructure', 'presentation'],
            },
            {
              from: 'infrastructure',
              disallow: ['presentation'],
            },
          ],
        },
      ],
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'domain',
              disallow: ['*'],
            },
            {
              from: 'application',
              disallow: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'coverage/**',
      'babel.config.js',
      'jest.config.js',
      'eslint.config.js',
      'metro.config.js',
    ],
  },
]);
