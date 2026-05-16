import { DomainError } from '@/domain/errors/DomainError';

export class InvalidQueryError extends DomainError {
  readonly code = 'INVALID_QUERY' as const;
}
