import { DomainError } from '@/domain/errors/DomainError';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';

export function getErrorMessage(error: unknown): string {
  if (error instanceof RateLimitError) {
    return 'Você excedeu o limite de requisições da API do GitHub. Aguarde alguns minutos.';
  }
  if (error instanceof NetworkError) {
    return 'Sem conexão. Verifique sua internet e tente novamente.';
  }
  if (error instanceof NotFoundError) {
    return error.message;
  }
  if (error instanceof InvalidQueryError) {
    return error.message;
  }
  if (error instanceof DomainError) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
