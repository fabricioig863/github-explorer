import { DomainError } from '@/domain/errors/DomainError';

export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR' as const;

  constructor(message = 'Não foi possível conectar ao servidor.') {
    super(message);
  }
}
