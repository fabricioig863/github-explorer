import { UnsaveRepoUseCase } from '@/application/use-cases/UnsaveRepoUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';

describe('UnsaveRepoUseCase', () => {
  it('trims fullName and delegates to repository', async () => {
    const repo = new FakeSavedReposRepository();
    const useCase = new UnsaveRepoUseCase(repo);

    await useCase.execute('  facebook/react-native  ');

    expect(repo.unsave).toHaveBeenCalledWith('facebook/react-native');
  });

  it('throws InvalidQueryError when fullName is empty', async () => {
    const repo = new FakeSavedReposRepository();
    const useCase = new UnsaveRepoUseCase(repo);

    await expect(useCase.execute('   ')).rejects.toBeInstanceOf(InvalidQueryError);
    expect(repo.unsave).not.toHaveBeenCalled();
  });
});
