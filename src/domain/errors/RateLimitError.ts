import { DomainError } from '@/domain/errors/DomainError';

export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT_EXCEEDED' as const;

  constructor(
    message = 'Você excedeu o limite de requisições da API do GitHub.',
    readonly resetAt?: Date,
  ) {
    super(message);
  }
}
