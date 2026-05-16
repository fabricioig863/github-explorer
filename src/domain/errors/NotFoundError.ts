import { DomainError } from '@/domain/errors/DomainError';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND' as const;

  constructor(resource: string) {
    super(`${resource} não foi encontrado.`);
  }
}
