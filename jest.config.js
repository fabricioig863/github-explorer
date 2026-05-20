module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/test-utils/jest.setup.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],
  // test-utils/ não tem ignore explícito — testMatch só pega *.test.ts(x),
  // logo fakes/fixtures/jest.setup/renderWithProviders.tsx não viram suites.
  // Excluir o dir inteiro bloquearia meta-tests legítimos como o de isolamento
  // de QueryClient em renderWithProviders.test.tsx.
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/domain/**/*.{ts,tsx}',
    'src/application/**/*.{ts,tsx}',
    'src/infra/**/*.{ts,tsx}',
    'src/presentation/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/*.d.ts',
    '!src/infra/reactotron/**',
    '!src/infra/repositories/InMemory*.ts',
    '!src/infra/repositories/fixtures/**',
    '!src/infra/theme/AppThemeProvider.tsx',
    '!src/infra/theme/themeStorage.ts',
    '!src/infra/theme/fonts.ts',
    '!src/infra/theme/lightTheme.ts',
    '!src/infra/theme/darkTheme.ts',
    '!src/infra/theme/tokens/**',
    '!src/infra/theme/languageColors.ts',
    '!src/infra/navigation/**',
    '!src/presentation/navigation/**',
    '!src/presentation/design-system/**',
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 60,
      lines: 75,
    },
    './src/domain/': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/application/': {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },
  moduleNameMapper: {
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/application/(.*)$': '<rootDir>/src/application/$1',
    '^@/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@/presentation/(.*)$': '<rootDir>/src/presentation/$1',
  },
};
