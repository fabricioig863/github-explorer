import { setupServer } from 'msw/node';

export const server = setupServer();

export const GITHUB_BASE_URL = 'https://api.github.com';
