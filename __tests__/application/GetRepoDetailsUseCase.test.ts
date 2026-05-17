import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NotFoundError } from '@/domain/errors/NotFoundError';

import { FakeRepoRepository } from '../test-utils/fakes/FakeRepoRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';

describe('GetRepoDetailsUseCase', () => {
  it('trims owner and repo before delegating', async () => {
    const repo = new FakeRepoRepository({ getDetails: makeRepository() });
    const useCase = new GetRepoDetailsUseCase(repo);

    await useCase.execute({ owner: '  facebook  ', repo: '  react-native  ' });

    expect(repo.getDetails).toHaveBeenCalledWith('facebook', 'react-native');
  });

  it('throws InvalidQueryError when owner is empty after trim', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new GetRepoDetailsUseCase(repo);

    await expect(useCase.execute({ owner: '   ', repo: 'react-native' })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
    expect(repo.getDetails).not.toHaveBeenCalled();
  });

  it('throws InvalidQueryError when repo is empty after trim', async () => {
    const repo = new FakeRepoRepository();
    const useCase = new GetRepoDetailsUseCase(repo);

    await expect(useCase.execute({ owner: 'facebook', repo: '' })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
  });

  it('propagates NotFoundError from repository', async () => {
    const repo = new FakeRepoRepository();
    repo.getDetails.mockRejectedValueOnce(new NotFoundError('Repositório'));
    const useCase = new GetRepoDetailsUseCase(repo);

    await expect(useCase.execute({ owner: 'foo', repo: 'bar' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns the repository when delegation succeeds', async () => {
    const expected = makeRepository({ fullName: 'foo/bar' });
    const repo = new FakeRepoRepository({ getDetails: expected });
    const useCase = new GetRepoDetailsUseCase(repo);

    const result = await useCase.execute({ owner: 'foo', repo: 'bar' });
    expect(result).toBe(expected);
  });
});
