import { UnsaveRepoUseCase } from '@/application/use-cases/UnsaveRepoUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeSavedReposRepository } from '../test-utils/fakes/FakeSavedReposRepository';

describe('UnsaveRepoUseCase', () => {
  describe('sanitização', () => {
    it('trim fullName antes de delegar', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new UnsaveRepoUseCase(repo);

      await useCase.execute('  facebook/react-native  ');

      expect(repo.unsave).toHaveBeenCalledWith('facebook/react-native');
    });
  });

  describe('validação', () => {
    it('rejeita fullName só whitespace e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new UnsaveRepoUseCase(repo);

      await expect(useCase.execute('   ')).rejects.toBeInstanceOf(InvalidQueryError);
      expect(repo.unsave).not.toHaveBeenCalled();
    });

    it('rejeita fullName vazio e não chama o repo', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new UnsaveRepoUseCase(repo);

      await expect(useCase.execute('')).rejects.toBeInstanceOf(InvalidQueryError);
      expect(repo.unsave).not.toHaveBeenCalled();
    });
  });

  describe('pass-through de retorno', () => {
    it('resolve void (não retorna valor) e chama o repo exatamente uma vez', async () => {
      const repo = new FakeSavedReposRepository();
      const useCase = new UnsaveRepoUseCase(repo);

      const result = await useCase.execute('foo/bar');

      expect(result).toBeUndefined();
      expect(repo.unsave).toHaveBeenCalledTimes(1);
    });
  });

  describe('propagação de erros tipados', () => {
    it('propaga UnexpectedError do repo sem reembrulhar', async () => {
      const repo = new FakeSavedReposRepository();
      const err = new UnexpectedError();
      repo.unsave.mockRejectedValueOnce(err);
      const useCase = new UnsaveRepoUseCase(repo);

      await expect(useCase.execute('foo/bar')).rejects.toBe(err);
    });
  });
});
