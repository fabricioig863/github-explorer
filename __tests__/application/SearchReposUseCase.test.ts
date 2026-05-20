import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeRepoRepository } from '../test-utils/fakes/FakeRepoRepository';
import { makeRepository } from '../test-utils/fixtures/repository.fixture';

describe('SearchReposUseCase', () => {
  describe('sanitização', () => {
    it.each([
      ['leading whitespace', ' react', 'react'],
      ['trailing whitespace', 'react ', 'react'],
      ['both sides', '   react   ', 'react'],
    ])('trim de query: %s', async (_label, input, expected) => {
      const repo = new FakeRepoRepository();
      const useCase = new SearchReposUseCase(repo);

      await useCase.execute({ query: input, page: 1 });

      expect(repo.search).toHaveBeenCalledWith({ query: expected, page: 1, perPage: 20 });
    });
  });

  describe('validação', () => {
    it('rejeita query só com whitespace e não chama o repo', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new SearchReposUseCase(repo);

      await expect(useCase.execute({ query: '   ', page: 1 })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.search).not.toHaveBeenCalled();
    });

    it('rejeita query com 1 char (< 2 após trim) e não chama o repo', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new SearchReposUseCase(repo);

      await expect(useCase.execute({ query: ' a ', page: 1 })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.search).not.toHaveBeenCalled();
    });
  });

  describe('defaults de regra de negócio', () => {
    it('aplica perPage padrão = 20 quando ausente', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new SearchReposUseCase(repo);

      await useCase.execute({ query: 'react', page: 2 });

      expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 2, perPage: 20 });
    });

    it('encaminha perPage customizado quando fornecido', async () => {
      const repo = new FakeRepoRepository();
      const useCase = new SearchReposUseCase(repo);

      await useCase.execute({ query: 'react', page: 1, perPage: 50 });

      expect(repo.search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 50 });
    });
  });

  describe('pass-through de retorno', () => {
    it('devolve PaginatedResult do repo sem mutar (referência preservada)', async () => {
      const expected = {
        items: [makeRepository({ id: 1 }), makeRepository({ id: 2 })],
        totalCount: 2,
        hasNextPage: false,
      };
      const repo = new FakeRepoRepository({ search: expected });
      const useCase = new SearchReposUseCase(repo);

      const result = await useCase.execute({ query: 'react', page: 1 });

      expect(result).toBe(expected);
    });
  });

  describe('propagação de erros tipados', () => {
    it.each([
      ['NetworkError', new NetworkError()],
      ['RateLimitError', new RateLimitError()],
      ['NotFoundError', new NotFoundError('Repositório')],
      ['UnexpectedError', new UnexpectedError()],
    ])('propaga %s sem reembrulhar', async (_label, error) => {
      const repo = new FakeRepoRepository();
      repo.search.mockRejectedValueOnce(error);
      const useCase = new SearchReposUseCase(repo);

      await expect(useCase.execute({ query: 'react', page: 1 })).rejects.toBe(error);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna Repository com pushedAt já como Date (não string ISO crua)', async () => {
      const expected = {
        items: [makeRepository({ pushedAt: new Date('2026-01-15T10:00:00Z') })],
        totalCount: 1,
        hasNextPage: false,
      };
      const repo = new FakeRepoRepository({ search: expected });
      const useCase = new SearchReposUseCase(repo);

      const result = await useCase.execute({ query: 'react', page: 1 });

      expect(result.items[0]?.pushedAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('total_count');
      expect(result.items[0]).not.toHaveProperty('pushed_at');
    });
  });
});
