import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';

import { FakeRepoRepository } from '../test-utils/fakes/FakeRepoRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';

describe('SearchReposUseCase', () => {
  it('trims whitespace from query before delegating', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new SearchReposUseCase(repo);

    await useCase.execute({ query: '  react  ', page: 1 });

    expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
  });

  it('throws InvalidQueryError when trimmed query has less than 2 chars', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new SearchReposUseCase(repo);

    await expect(useCase.execute({ query: ' a ', page: 1 })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
    expect(repo.search).not.toHaveBeenCalled();
  });

  it('throws InvalidQueryError when query is only whitespace', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new SearchReposUseCase(repo);

    await expect(useCase.execute({ query: '   ', page: 1 })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
  });

  it('applies default perPage = 20 when not provided', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new SearchReposUseCase(repo);

    await useCase.execute({ query: 'react', page: 2 });

    expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 2, perPage: 20 });
  });

  it('forwards custom perPage when provided', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new SearchReposUseCase(repo);

    await useCase.execute({ query: 'react', page: 1, perPage: 50 });

    expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 50 });
  });

  it('propagates errors from repository without wrapping', async () => {
    const repo = new FakeRepoRepository();
    repo.search.mockRejectedValueOnce(new NetworkError());
    const useCase = new SearchReposUseCase(repo);

    await expect(useCase.execute({ query: 'react', page: 1 })).rejects.toBeInstanceOf(
      NetworkError,
    );
  });

  it('returns the paginated result from the repository', async () => {
    const expected = {
      items: [makeRepository({ id: 1 }), makeRepository({ id: 2 })],
      totalCount: 2,
      hasNextPage: false,
    };
    const repo = new FakeRepoRepository({ search: expected });
    const useCase = new SearchReposUseCase(repo);

    const result = await useCase.execute({ query: 'react', page: 1 });

    expect(result).toEqual(expected);
  });
});
