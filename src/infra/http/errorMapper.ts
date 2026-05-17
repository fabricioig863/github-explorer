import axios, { type AxiosError } from 'axios';

import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

function isRateLimit(err: AxiosError): boolean {
  const status = err.response?.status;
  if (status === 429) return true;
  if (status === 403) {
    const remaining = err.response?.headers['x-ratelimit-remaining'];
    return remaining === '0';
  }
  return false;
}

function parseResetAt(err: AxiosError): Date | undefined {
  const resetHeader = err.response?.headers['x-ratelimit-reset'];
  if (typeof resetHeader !== 'string') return undefined;
  const resetUnix = Number.parseInt(resetHeader, 10);
  if (Number.isNaN(resetUnix)) return undefined;
  return new Date(resetUnix * 1000);
}

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
