import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import { GitHubIssueRepository } from '@/infrastructure/repositories/GitHubIssueRepository';
import { GitHubRepoRepository } from '@/infrastructure/repositories/GitHubRepoRepository';
import { InMemoryIssueRepository } from '@/infrastructure/repositories/InMemoryIssueRepository';
import { InMemoryRepoRepository } from '@/infrastructure/repositories/InMemoryRepoRepository';

// Expo expõe vars com prefixo EXPO_PUBLIC_ no bundle JS.
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function buildRepoRepository(): IRepoRepository {
  if (USE_MOCK) return new InMemoryRepoRepository();
  return new GitHubRepoRepository();
}

function buildIssueRepository(): IIssueRepository {
  if (USE_MOCK) return new InMemoryIssueRepository();
  return new GitHubIssueRepository();
}

const repoRepository = buildRepoRepository();
const issueRepository = buildIssueRepository();

export const container = {
  searchReposUseCase: new SearchReposUseCase(repoRepository),
  getRepoDetailsUseCase: new GetRepoDetailsUseCase(repoRepository),
  listIssuesUseCase: new ListIssuesUseCase(issueRepository),
  countOpenIssuesUseCase: new CountOpenIssuesUseCase(issueRepository),
} as const;

export type Container = typeof container;
