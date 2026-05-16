import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import { InMemoryIssueRepository } from '@/infrastructure/repositories/InMemoryIssueRepository';
import { InMemoryRepoRepository } from '@/infrastructure/repositories/InMemoryRepoRepository';

// Expo expõe vars com prefixo EXPO_PUBLIC_ no bundle JS.
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function buildRepoRepository(): IRepoRepository {
  if (USE_MOCK) {
    return new InMemoryRepoRepository();
  }
  throw new Error('HTTP RepoRepository not yet implemented. Set EXPO_PUBLIC_USE_MOCK=true.');
}

function buildIssueRepository(): IIssueRepository {
  if (USE_MOCK) {
    return new InMemoryIssueRepository();
  }
  throw new Error('HTTP IssueRepository not yet implemented. Set EXPO_PUBLIC_USE_MOCK=true.');
}

const repoRepository = buildRepoRepository();
const issueRepository = buildIssueRepository();

export const container = {
  searchReposUseCase: new SearchReposUseCase(repoRepository),
  getRepoDetailsUseCase: new GetRepoDetailsUseCase(repoRepository),
  listIssuesUseCase: new ListIssuesUseCase(issueRepository),
} as const;

export type Container = typeof container;
