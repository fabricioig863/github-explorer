import axios, { type AxiosInstance } from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Cliente HTTP configurado pra API do GitHub.
 * Singleton — usar mesmo instance em todos os repositórios.
 *
 * Interceptor adiciona Bearer token se EXPO_PUBLIC_GITHUB_TOKEN estiver setado.
 * Sem token: 60 req/h. Com token: 5000 req/h.
 */
export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: GITHUB_API_BASE,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const token = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
  if (token !== undefined && token.length > 0) {
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  return client;
}

export const httpClient = createHttpClient();
