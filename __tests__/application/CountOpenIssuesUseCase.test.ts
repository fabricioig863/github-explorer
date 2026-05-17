import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { FakeIssueRepository } from '../test-utils/fakes/FakeIssueRepository';

describe('CountOpenIssuesUseCase', () => {
  it('trims owner/repo before delegating', async () => {
    const repo = new FakeIssueRepository({ countOpen: 42 });
    const useCase = new CountOpenIssuesUseCase(repo);

    const count = await useCase.execute({ owner: '  foo  ', repo: '  bar  ' });

    expect(repo.countOpen).toHaveBeenCalledWith({ owner: 'foo', repo: 'bar' });
    expect(count).toBe(42);
  });

  it('throws InvalidQueryError when owner is empty after trim', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new CountOpenIssuesUseCase(repo);

    await expect(useCase.execute({ owner: '', repo: 'bar' })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
    expect(repo.countOpen).not.toHaveBeenCalled();
  });

  it('throws InvalidQueryError when repo is empty after trim', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new CountOpenIssuesUseCase(repo);

    await expect(useCase.execute({ owner: 'foo', repo: ' ' })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
  });

  it('propagates UnexpectedError from repository', async () => {
    const repo = new FakeIssueRepository();
    repo.countOpen.mockRejectedValueOnce(new UnexpectedError());
    const useCase = new CountOpenIssuesUseCase(repo);

    await expect(useCase.execute({ owner: 'foo', repo: 'bar' })).rejects.toBeInstanceOf(
      UnexpectedError,
    );
  });
});
