import { DomainError } from '@/domain/errors/DomainError';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { getErrorMessage } from '@/presentation/utils/getErrorMessage';

class CustomDomainError extends DomainError {
  readonly code = 'CUSTOM' as const;
}

describe('getErrorMessage', () => {
  it('returns rate-limit copy for RateLimitError', () => {
    expect(getErrorMessage(new RateLimitError())).toBe(
      'Você excedeu o limite de requisições da API do GitHub. Aguarde alguns minutos.',
    );
  });

  it('returns offline copy for NetworkError', () => {
    expect(getErrorMessage(new NetworkError())).toBe(
      'Sem conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('forwards NotFoundError.message verbatim', () => {
    expect(getErrorMessage(new NotFoundError('Repositório foo/bar'))).toBe(
      'Repositório foo/bar não foi encontrado.',
    );
  });

  it('forwards InvalidQueryError.message verbatim', () => {
    expect(getErrorMessage(new InvalidQueryError('Query inválida.'))).toBe('Query inválida.');
  });

  it('forwards generic DomainError.message verbatim', () => {
    expect(getErrorMessage(new CustomDomainError('Algo do domínio'))).toBe('Algo do domínio');
  });

  it('returns fallback for unknown errors', () => {
    expect(getErrorMessage(new Error('plain js error'))).toBe(
      'Ocorreu um erro inesperado. Tente novamente.',
    );
    expect(getErrorMessage('a string')).toBe('Ocorreu um erro inesperado. Tente novamente.');
    expect(getErrorMessage(undefined)).toBe('Ocorreu um erro inesperado. Tente novamente.');
    expect(getErrorMessage(null)).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });
});
