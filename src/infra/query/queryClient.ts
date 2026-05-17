import { QueryClient } from '@tanstack/react-query';

import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

/**
 * Decide se falha deve ser retentada.
 *
 * Não retenta: RateLimitError, InvalidQueryError, NotFoundError (determinísticos).
 * Retenta 1×: NetworkError, UnexpectedError (transientes).
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof RateLimitError) return false;
  if (error instanceof InvalidQueryError) return false;
  if (error instanceof NotFoundError) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_SECONDS,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});
