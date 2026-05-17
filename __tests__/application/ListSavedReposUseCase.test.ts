import { ListSavedReposUseCase } from '@/application/use-cases/ListSavedReposUseCase';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';
import { makeSavedRepo } from '../test-utils/fixtures/savedRepo.fixture';

describe('ListSavedReposUseCase', () => {
  it('returns the SavedRepo[] from the repository', async () => {
    const items = [makeSavedRepo({ id: 1 }), makeSavedRepo({ id: 2, fullName: 'a/b', name: 'b' })];
    const repo = new FakeSavedReposRepository({ list: items });
    const useCase = new ListSavedReposUseCase(repo);

    const result = await useCase.execute();
    expect(result).toEqual(items);
    expect(repo.list).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when nothing is saved', async () => {
    const repo = new FakeSavedReposRepository({ list: [] });
    const useCase = new ListSavedReposUseCase(repo);
    expect(await useCase.execute()).toEqual([]);
  });
});
