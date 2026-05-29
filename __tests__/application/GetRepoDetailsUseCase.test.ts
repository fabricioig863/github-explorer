import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';

import { FakeRepoRepository } from '../test-utils/fakes/FakeRepoRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';

describe('GetRepoDetailsUseCase', () => {
  describe('sanitização', () => {
    it('trim owner e repo antes de delegar', async () => {
      const repo = new FakeRepoRepository({ getDetails: makeRepository() });
      const useCase = new GetRepoDetailsUseCase(repo);

      await useCase.execute({ owner: '  facebook  ', repo: '  react-native  ' });

      expect(repo.getDetails).toHaveBeenCalledWith('facebook', 'react-native');
    });

    it.each([
      ['leading owner ws', ' foo', 'bar'],
      ['trailing repo ws', 'foo', 'bar '],
    ])('trim parcial: %s', async (_label, owner, r) => {
      const repo = new FakeRepoRepository({ getDetails: makeRepository() });
      const useCase = new GetRepoDetailsUseCase(repo);

      await useCase.execute({ owner, repo: r });

      expect(repo.getDetails).toHaveBeenCalledWith('foo', 'bar');
    });
  });

  describe('validação', () => {
    it('rejeita owner vazio (whitespace) e não chama o repo', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new GetRepoDetailsUseCase(repo);

      await expect(useCase.execute({ owner: '   ', repo: 'react-native' })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.getDetails).not.toHaveBeenCalled();
    });

    it('rejeita repo vazio e não chama o repo', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new GetRepoDetailsUseCase(repo);

      await expect(useCase.execute({ owner: 'facebook', repo: '' })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.getDetails).not.toHaveBeenCalled();
    });
  });

  describe('pass-through de retorno', () => {
    it('devolve o Repository do repo sem mutar (referência preservada)', async () => {
      const expected = makeRepository({ fullName: 'foo/bar' });
      const repo = new FakeRepoRepository({ getDetails: expected });
      const useCase = new GetRepoDetailsUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar' });
      expect(result).toBe(expected);
    });
  });

  describe('propagação de erros tipados', () => {
    it.each([
      ['NotFoundError', new NotFoundError('Repositório')],
      ['NetworkError', new NetworkError()],
      ['RateLimitError', new RateLimitError()],
    ])('propaga %s sem reembrulhar', async (_label, error) => {
      const repo = new FakeRepoRepository();
      repo.getDetails.mockRejectedValueOnce(error);
      const useCase = new GetRepoDetailsUseCase(repo);

      await expect(useCase.execute({ owner: 'foo', repo: 'bar' })).rejects.toBe(error);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna Repository com pushedAt como Date (não string ISO crua)', async () => {
      const expected = makeRepository({ pushedAt: new Date('2026-01-15T10:00:00Z') });
      const repo = new FakeRepoRepository({ getDetails: expected });
      const useCase = new GetRepoDetailsUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar' });

      expect(result.pushedAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('pushed_at');
      expect(result).not.toHaveProperty('full_name');
    });
  });
});
