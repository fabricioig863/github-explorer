import { ListSavedReposUseCase } from '@/application/use-cases/ListSavedReposUseCase';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';
import { makeSavedRepo } from '../test-utils/fixtures/savedRepo.fixture';

describe('ListSavedReposUseCase', () => {
  // sanitização / validação / defaults: N/A — use case não tem input.

  describe('pass-through de retorno', () => {
    it('devolve o array do repo sem mutar (referência preservada)', async () => {
      const items = [
        makeSavedRepo({ id: 1 }),
        makeSavedRepo({ id: 2, fullName: 'a/b', name: 'b' }),
      ];
      const repo = new FakeSavedReposRepository({ list: items });
      const useCase = new ListSavedReposUseCase(repo);

      const result = await useCase.execute();

      expect(result).toBe(items);
      expect(repo.list).toHaveBeenCalledTimes(1);
    });

    it('devolve array vazio quando nada está salvo', async () => {
      const repo = new FakeSavedReposRepository({ list: [] });
      const useCase = new ListSavedReposUseCase(repo);

      expect(await useCase.execute()).toEqual([]);
    });
  });

  describe('propagação de erros tipados', () => {
    it('propaga UnexpectedError do repo sem reembrulhar', async () => {
      const repo = new FakeSavedReposRepository();
      const err = new UnexpectedError();
      repo.list.mockRejectedValueOnce(err);
      const useCase = new ListSavedReposUseCase(repo);

      await expect(useCase.execute()).rejects.toBe(err);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna SavedRepo[] com savedAt como Date em cada item', async () => {
      const items = [
        makeSavedRepo({ id: 1, savedAt: new Date('2026-05-17T10:00:00Z') }),
        makeSavedRepo({ id: 2, savedAt: new Date('2026-05-18T10:00:00Z') }),
      ];
      const repo = new FakeSavedReposRepository({ list: items });
      const useCase = new ListSavedReposUseCase(repo);

      const result = await useCase.execute();

      expect(result[0]?.savedAt).toBeInstanceOf(Date);
      expect(result[1]?.savedAt).toBeInstanceOf(Date);
      expect(result[0]).not.toHaveProperty('saved_at');
    });
  });
});
