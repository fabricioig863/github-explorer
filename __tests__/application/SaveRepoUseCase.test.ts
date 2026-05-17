import { SaveRepoUseCase } from '@/application/use-cases/SaveRepoUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';
import { makeSavedRepo } from '../test-utils/fixtures/savedRepo.fixture';

describe('SaveRepoUseCase', () => {
  it('delegates the Repository to the underlying save method', async () => {
    const expected = makeSavedRepo();
    const repo = new FakeSavedReposRepository({ save: expected });
    const useCase = new SaveRepoUseCase(repo);

    const result = await useCase.execute(makeRepository({ fullName: 'facebook/react-native' }));

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'facebook/react-native' }),
    );
    expect(result).toBe(expected);
  });

  it('throws InvalidQueryError when fullName is empty after trim', async () => {
    const repo = new FakeSavedReposRepository();
    const useCase = new SaveRepoUseCase(repo);

    await expect(useCase.execute(makeRepository({ fullName: '   ' }))).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
});
