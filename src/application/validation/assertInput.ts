import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';

/**
 * Trims owner/repo and guarantees both are non-empty.
 * Returns the sanitized values so callers can reuse them.
 */
export function assertOwnerRepo(
  rawOwner: string,
  rawRepo: string,
): { owner: string; repo: string } {
  const owner = rawOwner.trim();
  const repo = rawRepo.trim();

  if (!owner || !repo) {
    throw new InvalidQueryError('Owner e nome do repositório são obrigatórios.');
  }

  return { owner, repo };
}

/**
 * Trims a string and guarantees it is non-empty.
 * Returns the sanitized value so callers can reuse it.
 */
export function assertNonEmpty(value: string, message: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new InvalidQueryError(message);
  }

  return trimmed;
}
