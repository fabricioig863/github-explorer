import { IsRepoSavedUseCase } from '@/application/use-cases/IsRepoSavedUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';

describe('IsRepoSavedUseCase', () => {
  describe('sanitização', () => {
    it('trim fullName antes de delegar', async () => {
      const repo = new FakeSavedReposRepository({ isSaved: true });
      const useCase = new IsRepoSavedUseCase(repo);

      await useCase.execute('  foo/bar  ');

      expect(repo.isSaved).toHaveBeenCalledWith('foo/bar');
    });
  });

  describe('validação', () => {
    it('rejeita fullName vazio e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new IsRepoSavedUseCase(repo);

      await expect(useCase.execute('')).rejects.toBeInstanceOf(InvalidQueryError);
      expect(repo.isSaved).not.toHaveBeenCalled();
    });

    it('rejeita fullName só whitespace e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new IsRepoSavedUseCase(repo);

      await expect(useCase.execute('   ')).rejects.toBeInstanceOf(InvalidQueryError);
      expect(repo.isSaved).not.toHaveBeenCalled();
    });
  });

  describe('pass-through de retorno', () => {
    it.each([
      ['true', true],
      ['false', false],
    ])('devolve o boolean do repo: %s', async (_label, value) => {
      const repo = new FakeSavedReposRepository({ isSaved: value });
      const useCase = new IsRepoSavedUseCase(repo);

      const result = await useCase.execute('foo/bar');

      expect(result).toBe(value);
    });
  });

  describe('propagação de erros tipados', () => {
    it('propaga UnexpectedError do repo sem reembrulhar', async () => {
      const repo = new FakeSavedReposRepository();
      const err = new UnexpectedError();
      repo.isSaved.mockRejectedValueOnce(err);
      const useCase = new IsRepoSavedUseCase(repo);

      await expect(useCase.execute('foo/bar')).rejects.toBe(err);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna boolean puro (não objeto)', async () => {
      const repo = new FakeSavedReposRepository({ isSaved: true });
      const useCase = new IsRepoSavedUseCase(repo);

      const result = await useCase.execute('foo/bar');

      expect(typeof result).toBe('boolean');
    });
  });
});
