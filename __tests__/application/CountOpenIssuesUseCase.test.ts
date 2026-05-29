import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { NetworkError } from '@/domain/errors/NetworkError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeIssueRepository } from '../test-utils/fakes/FakeIssueRepository';

describe('CountOpenIssuesUseCase', () => {
  describe('sanitização', () => {
    it('trim owner e repo antes de delegar', async () => {
      const repo = new FakeIssueRepository({ countOpen: 42 });
      const useCase = new CountOpenIssuesUseCase(repo);

      const count = await useCase.execute({ owner: '  foo  ', repo: '  bar  ' });

      expect(repo.countOpen).toHaveBeenCalledWith({ owner: 'foo', repo: 'bar' });
      expect(count).toBe(42);
    });
  });

  describe('validação', () => {
    it('rejeita owner vazio e não chama o repo', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new CountOpenIssuesUseCase(repo);

      await expect(useCase.execute({ owner: '', repo: 'bar' })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.countOpen).not.toHaveBeenCalled();
    });

    it('rejeita repo vazio (whitespace) e não chama o repo', async () => {
      const repo = new FakeIssueRepository();
      const useCase = new CountOpenIssuesUseCase(repo);

      await expect(useCase.execute({ owner: 'foo', repo: ' ' })).rejects.toBeInstanceOf(
        InvalidQueryError,
      );
      expect(repo.countOpen).not.toHaveBeenCalled();
    });
  });

  describe('pass-through de retorno', () => {
    it.each([
      ['zero', 0],
      ['valor pequeno', 7],
      ['valor grande', 99_999],
    ])('devolve o number do repo sem mutação: %s', async (_label, value) => {
      const repo = new FakeIssueRepository({ countOpen: value });
      const useCase = new CountOpenIssuesUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar' });

      expect(result).toBe(value);
    });
  });

  describe('propagação de erros tipados', () => {
    it.each([
      ['UnexpectedError', new UnexpectedError()],
      ['RateLimitError', new RateLimitError()],
      ['NetworkError', new NetworkError()],
    ])('propaga %s sem reembrulhar', async (_label, error) => {
      const repo = new FakeIssueRepository();
      repo.countOpen.mockRejectedValueOnce(error);
      const useCase = new CountOpenIssuesUseCase(repo);

      await expect(useCase.execute({ owner: 'foo', repo: 'bar' })).rejects.toBe(error);
    });
  });

  describe('não vaza tipos da infra', () => {
    it('retorna number puro (não objeto DTO {total_count})', async () => {
      const repo = new FakeIssueRepository({ countOpen: 73 });
      const useCase = new CountOpenIssuesUseCase(repo);

      const result = await useCase.execute({ owner: 'foo', repo: 'bar' });

      expect(typeof result).toBe('number');
      expect(result).not.toEqual(expect.objectContaining({ total_count: expect.anything() }));
    });
  });
});
