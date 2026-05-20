import axios, { type AxiosInstance } from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 15000;

export interface CreateHttpClientOptions {
  // Permite override do timeout em testes de boundary (Fase 4 msw). Sem
  // este parâmetro, validar o caminho de timeout exigiria esperar 15s reais
  // por spec. Default mantém o comportamento de produção inalterado.
  timeoutMs?: number;
}

export function createHttpClient(options: CreateHttpClientOptions = {}): AxiosInstance {
  const client = axios.create({
    baseURL: GITHUB_API_BASE,
    timeout: options.timeoutMs ?? REQUEST_TIMEOUT_MS,
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
