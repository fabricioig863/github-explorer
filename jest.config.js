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
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.js',
  },
  // msw@2 publica builds condicionais via package.json#exports. jest-expo seta
  // a condição 'react-native' que mapeia `msw/node` para `null`, bloqueando o
  // módulo. Mapeamos `msw/node` direto para o bundle CJS pré-compilado.
  // Adicionalmente: msw depende transitivamente de `rettime` (e outros) que
  // são ESM-only. jest-expo permite transform sob `.pnpm/...` no nível raiz,
  // mas o regex padrão (não-âncorado) re-ignora arquivos sob o segundo
  // node_modules aninhado. Override abaixo lista explicitamente os deps ESM
  // do msw para que babel-jest os transpile para CJS.
  moduleDirectories: ['node_modules'],
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|msw|@mswjs|@bundled-es-modules|@open-draft|until-async|headers-polyfill|cookie|tough-cookie|outvariant|rettime|strict-event-emitter|graphql|statuses|is-node-process|path-to-regexp|set-cookie-parser|type-fest))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
