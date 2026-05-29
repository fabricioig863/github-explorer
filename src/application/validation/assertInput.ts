import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';

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

export function assertNonEmpty(value: string, message: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new InvalidQueryError(message);
  }

  return trimmed;
}
