import axios, { type AxiosError } from 'axios';

import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

/**
 * Detecta rate limit do GitHub.
 * GitHub sinaliza de duas formas:
 *   - Status 403 + header x-ratelimit-remaining=0 (limite primário)
 *   - Status 429 (abuse / secundário)
 */
function isRateLimit(err: AxiosError): boolean {
  const status = err.response?.status;
  if (status === 429) return true;
  if (status === 403) {
    const remaining = err.response?.headers['x-ratelimit-remaining'];
    return remaining === '0';
  }
  return false;
}

/**
 * Extrai timestamp de reset do rate limit, se disponível.
 * Header `x-ratelimit-reset` é Unix timestamp em segundos.
 */
function parseResetAt(err: AxiosError): Date | undefined {
  const resetHeader = err.response?.headers['x-ratelimit-reset'];
  if (typeof resetHeader !== 'string') return undefined;
  const resetUnix = Number.parseInt(resetHeader, 10);
  if (Number.isNaN(resetUnix)) return undefined;
  return new Date(resetUnix * 1000);
}

/**
 * Mapeia erro do axios pra DomainError concreto.
 * Sempre lança — função tem retorno `never` pra TS entender.
 *
 * @example
 * try {
 *   await client.get(...);
 * } catch (err) {
 *   throw mapHttpError(err, 'Repositório facebook/react-native');
 * }
 */
export function mapHttpError(err: unknown, resourceContext?: string): never {
  if (!axios.isAxiosError(err)) {
    throw new UnexpectedError();
  }

  if (err.response === undefined) {
    throw new NetworkError();
  }

  if (isRateLimit(err)) {
    throw new RateLimitError(undefined, parseResetAt(err));
  }

  if (err.response.status === 404) {
    throw new NotFoundError(resourceContext ?? 'Recurso');
  }

  throw new UnexpectedError();
}
