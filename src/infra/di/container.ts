import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { GetRecentCommitsUseCase } from '@/application/use-cases/GetRecentCommitsUseCase';
import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { GetUserProfileUseCase } from '@/application/use-cases/GetUserProfileUseCase';
import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import { GitHubIssueRepository } from 'src/infra/repositories/GitHubIssueRepository';
import { GitHubRepoRepository } from 'src/infra/repositories/GitHubRepoRepository';
import { GitHubUserRepository } from 'src/infra/repositories/GitHubUserRepository';
import { InMemoryIssueRepository } from 'src/infra/repositories/InMemoryIssueRepository';
import { InMemoryRepoRepository } from 'src/infra/repositories/InMemoryRepoRepository';
import { InMemoryUserRepository } from 'src/infra/repositories/InMemoryUserRepository';

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

function buildUserRepository(): IUserRepository {
  if (USE_MOCK) return new InMemoryUserRepository();
  return new GitHubUserRepository();
}

const repoRepository = buildRepoRepository();
const issueRepository = buildIssueRepository();
const userRepository = buildUserRepository();

export const container = {
  searchReposUseCase: new SearchReposUseCase(repoRepository),
  getRepoDetailsUseCase: new GetRepoDetailsUseCase(repoRepository),
  listIssuesUseCase: new ListIssuesUseCase(issueRepository),
  countOpenIssuesUseCase: new CountOpenIssuesUseCase(issueRepository),
  getUserProfileUseCase: new GetUserProfileUseCase(userRepository),
  getRecentCommitsUseCase: new GetRecentCommitsUseCase(userRepository),
} as const;

export type Container = typeof container;
