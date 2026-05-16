import { DomainError } from '@/domain/errors/DomainError';

export class UnexpectedError extends DomainError {
  readonly code = 'UNEXPECTED' as const;

  constructor(message = 'Ocorreu um erro inesperado.') {
    super(message);
  }
}
