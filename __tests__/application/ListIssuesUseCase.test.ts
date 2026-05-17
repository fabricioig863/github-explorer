import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import { RateLimitError } from '@/domain/errors/RateLimitError';

import { FakeIssueRepository } from '../test-utils/fakes/FakeIssueRepository';
import { makeIssue } from '../test-utils/fixtures/issue.fixture';

describe('ListIssuesUseCase', () => {
  it('trims owner/repo and applies default state=open and perPage=20', async () => {
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

  it('forwards state=closed when provided', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new ListIssuesUseCase(repo);

    await useCase.execute({ owner: 'foo', repo: 'bar', state: 'closed', page: 1 });

    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'closed' }));
  });

  it('forwards custom perPage when provided', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new ListIssuesUseCase(repo);

    await useCase.execute({ owner: 'foo', repo: 'bar', page: 1, perPage: 50 });

    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ perPage: 50 }));
  });

  it('throws InvalidQueryError when owner is empty after trim', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new ListIssuesUseCase(repo);

    await expect(useCase.execute({ owner: ' ', repo: 'bar', page: 1 })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
    expect(repo.list).not.toHaveBeenCalled();
  });

  it('throws InvalidQueryError when repo is empty after trim', async () => {
    const repo = new FakeIssueRepository();
    const useCase = new ListIssuesUseCase(repo);

    await expect(useCase.execute({ owner: 'foo', repo: '', page: 1 })).rejects.toBeInstanceOf(
      InvalidQueryError,
    );
  });

  it('propagates RateLimitError from repository intact', async () => {
    const repo = new FakeIssueRepository();
    repo.list.mockRejectedValueOnce(new RateLimitError());
    const useCase = new ListIssuesUseCase(repo);

    await expect(useCase.execute({ owner: 'foo', repo: 'bar', page: 1 })).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });

  it('returns the paginated issues result', async () => {
    const expected = { items: [makeIssue()], totalCount: 1, hasNextPage: false };
    const repo = new FakeIssueRepository({ list: expected });
    const useCase = new ListIssuesUseCase(repo);

    const result = await useCase.execute({ owner: 'foo', repo: 'bar', page: 1 });
    expect(result).toEqual(expected);
  });
});
