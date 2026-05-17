import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageSavedReposRepository } from 'src/infra/repositories/AsyncStorageSavedReposRepository';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';

describe('AsyncStorageSavedReposRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns empty array when storage is empty', async () => {
    const repo = new AsyncStorageSavedReposRepository();
    expect(await repo.list()).toEqual([]);
  });

  it('save persists across instances and survives round-trip serialization', async () => {
    const first = new AsyncStorageSavedReposRepository();
    await first.save(makeRepository({ fullName: 'foo/bar' }));

    const second = new AsyncStorageSavedReposRepository();
    const list = await second.list();

    expect(list).toHaveLength(1);
    expect(list[0]?.fullName).toBe('foo/bar');
    expect(list[0]?.savedAt).toBeInstanceOf(Date);
  });

  it('save is idempotent for the same fullName', async () => {
    const repo = new AsyncStorageSavedReposRepository();
    await repo.save(makeRepository({ fullName: 'a/b' }));
    await repo.save(makeRepository({ fullName: 'a/b' }));

    expect((await repo.list()).length).toBe(1);
  });

  it('unsave removes the entry from storage', async () => {
    const repo = new AsyncStorageSavedReposRepository();
    await repo.save(makeRepository({ fullName: 'a/b' }));
    await repo.save(makeRepository({ fullName: 'c/d', id: 99 }));
    await repo.unsave('a/b');

    const list = await repo.list();
    expect(list.map((r) => r.fullName)).toEqual(['c/d']);
  });

  it('isSaved reflects storage state', async () => {
    const repo = new AsyncStorageSavedReposRepository();
    expect(await repo.isSaved('foo/bar')).toBe(false);
    await repo.save(makeRepository({ fullName: 'foo/bar' }));
    expect(await repo.isSaved('foo/bar')).toBe(true);
  });

  it('list recovers gracefully from corrupted JSON in storage', async () => {
    await AsyncStorage.setItem('@github-explorer:saved-repos:v1', '{not valid json');
    const repo = new AsyncStorageSavedReposRepository();
    expect(await repo.list()).toEqual([]);
  });
});
