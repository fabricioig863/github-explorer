import { InMemorySavedReposRepository } from 'src/infra/repositories/InMemorySavedReposRepository';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';
import { makeSavedRepo } from '../../test-utils/fixtures/savedRepo.fixture';

describe('InMemorySavedReposRepository', () => {
  it('starts empty when no initial entries are provided', async () => {
    const repo = new InMemorySavedReposRepository();
    expect(await repo.list()).toEqual([]);
  });

  it('returns a copy sorted by savedAt desc', async () => {
    const older = makeSavedRepo({ id: 1, fullName: 'a/old', savedAt: new Date('2026-05-15') });
    const newer = makeSavedRepo({ id: 2, fullName: 'b/new', savedAt: new Date('2026-05-17') });
    const repo = new InMemorySavedReposRepository([older, newer]);

    const list = await repo.list();
    expect(list.map((entry) => entry.fullName)).toEqual(['b/new', 'a/old']);
  });

  it('save appends a SavedRepo derived from the Repository', async () => {
    const repo = new InMemorySavedReposRepository();
    const result = await repo.save(makeRepository({ fullName: 'octocat/hello-world' }));

    expect(result.fullName).toBe('octocat/hello-world');
    expect(result.savedAt).toBeInstanceOf(Date);
    expect(await repo.isSaved('octocat/hello-world')).toBe(true);
  });

  it('save is idempotent — saving the same repo twice keeps a single entry', async () => {
    const repo = new InMemorySavedReposRepository();
    const repository = makeRepository({ fullName: 'octocat/hello-world' });
    const first = await repo.save(repository);
    const second = await repo.save(repository);

    expect(second).toEqual(first);
    expect((await repo.list()).length).toBe(1);
  });

  it('unsave removes the entry by fullName', async () => {
    const repo = new InMemorySavedReposRepository([
      makeSavedRepo({ fullName: 'a/b', id: 1 }),
      makeSavedRepo({ fullName: 'c/d', id: 2 }),
    ]);

    await repo.unsave('a/b');
    const remaining = await repo.list();

    expect(remaining.map((r) => r.fullName)).toEqual(['c/d']);
    expect(await repo.isSaved('a/b')).toBe(false);
  });

  it('unsave on missing entry is a no-op', async () => {
    const repo = new InMemorySavedReposRepository([makeSavedRepo()]);
    await expect(repo.unsave('nonexistent/repo')).resolves.toBeUndefined();
    expect((await repo.list()).length).toBe(1);
  });
});
