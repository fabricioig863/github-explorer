import type { Repository } from '@/domain/entities/Repository';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { PaginatedResult } from '@/domain/repositories/Pagination';

export interface SearchReposInput {
  query: string;
  page: number;
  perPage?: number;
}

export class SearchReposUseCase {
  constructor(private readonly repoRepository: IRepoRepository) {}

  async execute(input: SearchReposInput): Promise<PaginatedResult<Repository>> {
    const sanitized = this.sanitize(input.query);
    this.validate(sanitized);

    return this.repoRepository.search({
      query: sanitized,
      page: input.page,
      perPage: input.perPage ?? 20,
    });
  }

  private sanitize(query: string): string {
    return query.trim();
  }

  private validate(query: string): void {
    if (query.length < 2) {
      throw new InvalidQueryError('A busca precisa ter pelo menos 2 caracteres.');
    }
  }
}
