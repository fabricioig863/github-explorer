import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';

import { FakeIssueRepository } from '../test-utils/fakes/FakeIssueRepository';
import { makeIssue } from '../test-utils/fixtures/issue.fixture';

describe('ListIssuesUseCase', () => {
  describe('sanitização', () => {
    it('trim owner e repo antes de delegar', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: '  foo  ', repo: '  bar  ', page: 1 });

      expect(repo.list).toHaveBeenCalledWith(
        expect.objectContaining({ owner: 'foo', repo: 'bar' }),
      );
    });
  });

  describe('validação', () => {
    it('rejeita owner vazio (whitespace) e não chama o repo', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await expect(useCase.execute({ owner: ' ', repo: 'bar', page: 1 })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.list).not.toHaveBeenCalled();
    });

    it('rejeita repo vazio e não chama o repo', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await expect(useCase.execute({ owner: 'foo', repo: '', page: 1 })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.list).not.toHaveBeenCalled();
    });
  });

  describe('defaults de regra de negócio', () => {
    it("state padrão = 'open' quando ausente", async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: 'foo', repo: 'bar', page: 1 });

      expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
    });

    it("encaminha state='closed' quando fornecido", async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: 'foo', repo: 'bar', state: 'closed', page: 1 });

      expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
    });

    it('perPage padrão = 20 quando ausente', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: 'foo', repo: 'bar', page: 1 });

      expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ perPage: 20 }));
    });

    it('encaminha perPage customizado', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: 'foo', repo: 'bar', page: 1, perPage: 50 });

      expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ perPage: 50 }));
    });

    it('payload completo: trim + defaults aplicados em uma só chamada', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new ListIssuesUseCase(repo);

      await useCase.execute({ owner: '  foo  ', repo: '  bar  ', page: 1 });

      expect(repo.list).toHaveBeenCalledWith({
        owner: 'foo',
        repo: 'bar',
        state: 'open',
        page: 1,
        perPage: 20,
      });
    });
  });

  describe('pass-through de retorno', () => {
    it('devolve PaginatedResult do repo sem mutar', async () => {
      const expected = { items: [makeIssue()], totalCount: 1, hasNextPage: false };
      const repo = new FakeIssueRepository({ list: expected });
      const useCase = new ListIssuesUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar', page: 1 });
      expect(result).toBe(expected);
    });
  });

  describe('propagação de erros tipados', () => {
    it.each([
      ['RateLimitError', new RateLimitError()],
      ['NetworkError', new NetworkError()],
      ['NotFoundError', new NotFoundError('Issues')],
    ])('propaga %s sem reembrulhar', async (_label, error) => {
      const repo = new FakeIssueRepository();
      repo.list.mockRejectedValueOnce(error);
      const useCase = new ListIssuesUseCase(repo);

      await expect(useCase.execute({ owner: 'foo', repo: 'bar', page: 1 })).rejects.toBe(error);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna Issue com createdAt como Date (não string ISO crua)', async () => {
      const expected = {
        items: [makeIssue({ createdAt: new Date('2026-02-10T09:00:00Z') })],
        totalCount: 1,
        hasNextPage: false,
      };
      const repo = new FakeIssueRepository({ list: expected });
      const useCase = new ListIssuesUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar', page: 1 });

      expect(result.items[0]?.createdAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('total_count');
      expect(result.items[0]).not.toHaveProperty('created_at');
      expect(result.items[0]).not.toHaveProperty('html_url');
    });
  });
});
