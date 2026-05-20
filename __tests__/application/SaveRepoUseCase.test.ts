import { SaveRepoUseCase } from '@/application/use-cases/SaveRepoUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';
import { makeSavedRepo } from '../test-utils/fixtures/savedRepo.fixture';

describe('SaveRepoUseCase', () => {
  // sanitização: o use case NÃO normaliza fullName (apenas checa que trim != '').
  // Quem normaliza é o próprio Repository que vem da camada superior. Por isso
  // não há teste de "trim aplicado" — apenas o teste de validação abaixo cobre o trim().

  describe('validação', () => {
    it('rejeita Repository com fullName só whitespace e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new SaveRepoUseCase(repo);

      await expect(useCase.execute(makeRepository({ fullName: '   ' }))).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejeita Repository com fullName vazio e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new SaveRepoUseCase(repo);

      await expect(useCase.execute(makeRepository({ fullName: '' }))).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  // defaults: N/A — input é um Repository já completo

  describe('pass-through de retorno', () => {
    it('encaminha o Repository ao repo e devolve o SavedRepo do repo (referência preservada)', async () => {
      const expected = makeSavedRepo();
      const repo = new FakeSavedReposRepository({ save: expected });
      const useCase = new SaveRepoUseCase(repo);

      const input = makeRepository({ fullName: 'facebook/react-native' });
      const result = await useCase.execute(input);

      expect(repo.save).toHaveBeenCalledWith(input);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });
  });

  describe('propagação de erros tipados', () => {
    it('propaga UnexpectedError do repo sem reembrulhar', async () => {
      const repo = new FakeSavedReposRepository();
      const err = new UnexpectedError();
      repo.save.mockRejectedValueOnce(err);
      const useCase = new SaveRepoUseCase(repo);

      await expect(useCase.execute(makeRepository())).rejects.toBe(err);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna SavedRepo com savedAt como Date (não string)', async () => {
      const expected = makeSavedRepo({ savedAt: new Date('2026-05-17T10:00:00Z') });
      const repo = new FakeSavedReposRepository({ save: expected });
      const useCase = new SaveRepoUseCase(repo);

      const result = await useCase.execute(makeRepository());

      expect(result.savedAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('saved_at');
      expect(result).not.toHaveProperty('full_name');
    });
  });
});
