import { setupServer } from 'msw/node';

// Sem handlers globais por padrão — cada teste declara seus próprios via
// `server.use(...)`. Com `onUnhandledRequest: 'error'` no jest.setup.ts,
// qualquer chamada HTTP não mockada quebra o teste explicitamente.
export const server = setupServer();

export const GITHUB_BASE_URL = 'https://api.github.com';
