import { DomainError } from '@/domain/errors/DomainError';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

describe('DomainError subclasses', () => {
  describe('NetworkError', () => {
    it('uses default pt-BR message and exposes literal code', () => {
      const err = new NetworkError();
      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.name).toBe('NetworkError');
      expect(err.message).toBe('Não foi possível conectar ao servidor.');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(DomainError);
      expect(err).toBeInstanceOf(NetworkError);
      expect(typeof err.stack).toBe('string');
    });

    it('accepts custom message', () => {
      const err = new NetworkError('Timeout');
      expect(err.message).toBe('Timeout');
    });
  });

  describe('RateLimitError', () => {
    it('uses default pt-BR message and literal code', () => {
      const err = new RateLimitError();
      expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(err.name).toBe('RateLimitError');
      expect(err.message).toBe('Você excedeu o limite de requisições da API do GitHub.');
      expect(err.resetAt).toBeUndefined();
      expect(err).toBeInstanceOf(DomainError);
    });

    it('preserves resetAt when provided', () => {
      const reset = new Date('2026-01-01T00:00:00Z');
      const err = new RateLimitError(undefined, reset);
      expect(err.resetAt).toBe(reset);
    });

    it('accepts custom message and resetAt together', () => {
      const reset = new Date('2026-06-01T12:00:00Z');
      const err = new RateLimitError('Limite atingido', reset);
      expect(err.message).toBe('Limite atingido');
      expect(err.resetAt).toBe(reset);
    });
  });

  describe('NotFoundError', () => {
    it('builds message from resource context', () => {
      const err = new NotFoundError('Repositório facebook/react-native');
      expect(err.code).toBe('NOT_FOUND');
      expect(err.name).toBe('NotFoundError');
      expect(err.message).toBe('Repositório facebook/react-native não foi encontrado.');
      expect(err).toBeInstanceOf(DomainError);
    });

    it('uses fallback "Recurso" when caller passes generic string', () => {
      const err = new NotFoundError('Recurso');
      expect(err.message).toBe('Recurso não foi encontrado.');
    });
  });

  describe('InvalidQueryError', () => {
    it('requires explicit message and uses literal code', () => {
      const err = new InvalidQueryError('Busca precisa ter ao menos 2 caracteres.');
      expect(err.code).toBe('INVALID_QUERY');
      expect(err.name).toBe('InvalidQueryError');
      expect(err.message).toBe('Busca precisa ter ao menos 2 caracteres.');
      expect(err).toBeInstanceOf(DomainError);
    });
  });

  describe('UnexpectedError', () => {
    it('uses default pt-BR message and literal code', () => {
      const err = new UnexpectedError();
      expect(err.code).toBe('UNEXPECTED');
      expect(err.name).toBe('UnexpectedError');
      expect(err.message).toBe('Ocorreu um erro inesperado.');
      expect(err).toBeInstanceOf(DomainError);
    });

    it('accepts custom message', () => {
      const err = new UnexpectedError('Boom');
      expect(err.message).toBe('Boom');
    });
  });

  describe('stack capture fallback', () => {
    it('still constructs when Error.captureStackTrace is absent', () => {
      const original = (Error as unknown as { captureStackTrace?: unknown }).captureStackTrace;
      (Error as unknown as { captureStackTrace?: unknown }).captureStackTrace = undefined;
      try {
        const err = new NetworkError();
        expect(err).toBeInstanceOf(NetworkError);
        expect(err.message).toBe('Não foi possível conectar ao servidor.');
      } finally {
        (Error as unknown as { captureStackTrace?: unknown }).captureStackTrace = original;
      }
    });
  });
});
