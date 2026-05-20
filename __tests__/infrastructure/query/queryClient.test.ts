import type { QueryClient } from '@tanstack/react-query';

import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';
import { queryClient } from 'src/infra/query/queryClient';

// `shouldRetry` é função privada do módulo. É exposta no runtime via
// `defaultOptions.queries.retry` do QueryClient. Tipo do React Query aceita
// boolean | number | (failureCount, error) => boolean. Para chamá-la em testes,
// extraímos como union, com narrowing por `typeof === 'function'`.
function getRetryFn(client: QueryClient): (count: number, err: unknown) => boolean {
  const retry = client.getDefaultOptions().queries?.retry;
  if (typeof retry !== 'function') {
    throw new Error('queryClient.defaultOptions.queries.retry deve ser function');
  }
  return retry as (count: number, err: unknown) => boolean;
}

describe('queryClient (infra/query/queryClient)', () => {
  describe('configuração de defaults', () => {
    it('staleTime = 5 minutos', () => {
      expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
    });

    it('gcTime = 30 segundos', () => {
      expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(30 * 1000);
    });

    it('refetchOnWindowFocus = false (irrelevante em mobile, evita refetchs em background)', () => {
      expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    });
  });

  describe('shouldRetry — política de retry por tipo de erro', () => {
    it('NÃO retry para RateLimitError (rate limit não some com retry)', () => {
      const retry = getRetryFn(queryClient);
      expect(retry(0, new RateLimitError())).toBe(false);
    });

    it('NÃO retry para InvalidQueryError (input ruim, retry só repete o erro)', () => {
      const retry = getRetryFn(queryClient);
      expect(retry(0, new InvalidQueryError('curta'))).toBe(false);
    });

    it('NÃO retry para NotFoundError (recurso não existe, retry inútil)', () => {
      const retry = getRetryFn(queryClient);
      expect(retry(0, new NotFoundError('Repositório'))).toBe(false);
    });

    it('retry uma vez em failureCount = 0 para erros não-tipados (NetworkError, etc.)', () => {
      const retry = getRetryFn(queryClient);
      expect(retry(0, new NetworkError())).toBe(true);
      expect(retry(0, new UnexpectedError())).toBe(true);
      expect(retry(0, new Error('qualquer'))).toBe(true);
    });

    it('NÃO retry após primeira falha (failureCount >= 1) — máximo 1 retry', () => {
      const retry = getRetryFn(queryClient);
      expect(retry(1, new NetworkError())).toBe(false);
      expect(retry(2, new UnexpectedError())).toBe(false);
    });
  });
});
