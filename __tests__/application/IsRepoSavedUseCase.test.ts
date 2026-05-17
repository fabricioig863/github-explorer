import { IsRepoSavedUseCase } from '@/application/use-cases/IsRepoSavedUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';

describe('IsRepoSavedUseCase', () => {
  it('trims fullName and delegates', async () => {
    const repo = new FakeSavedReposRepository({ isSaved: true });
    const useCase = new IsRepoSavedUseCase(repo);

    const result = await useCase.execute('  foo/bar  ');

    expect(repo.isSaved).toHaveBeenCalledWith('foo/bar');
    expect(result).toBe(true);
  });

  it('throws InvalidQueryError when fullName is empty after trim', async () => {
    const repo = new FakeSavedReposRepository();
    const useCase = new IsRepoSavedUseCase(repo);
    await expect(useCase.execute('')).rejects.toBeInstanceOf(InvalidQueryError);
  });
});
