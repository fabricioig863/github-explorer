import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { IsRepoSavedUseCase } from '@/application/use-cases/IsRepoSavedUseCase';
import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { ListSavedReposUseCase } from '@/application/use-cases/ListSavedReposUseCase';
import { SaveRepoUseCase } from '@/application/use-cases/SaveRepoUseCase';
import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import { UnsaveRepoUseCase } from '@/application/use-cases/UnsaveRepoUseCase';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';
import { AsyncStorageSavedReposRepository } from 'src/infra/repositories/AsyncStorageSavedReposRepository';
import { GitHubIssueRepository } from 'src/infra/repositories/GitHubIssueRepository';
import { GitHubRepoRepository } from 'src/infra/repositories/GitHubRepoRepository';
import { InMemoryIssueRepository } from 'src/infra/repositories/InMemoryIssueRepository';
import { InMemoryRepoRepository } from 'src/infra/repositories/InMemoryRepoRepository';
import { InMemorySavedReposRepository } from 'src/infra/repositories/InMemorySavedReposRepository';

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

/**
 * SavedRepos sempre usa AsyncStorage em runtime real — não há "versão HTTP"
 * desta feature (persistência é puramente local). Em mock substituímos por
 * InMemory para isolar a UI do AsyncStorage durante o desenvolvimento.
 */
function buildSavedReposRepository(): ISavedReposRepository {
  if (USE_MOCK) return new InMemorySavedReposRepository();
  return new AsyncStorageSavedReposRepository();
}

const repoRepository = buildRepoRepository();
const issueRepository = buildIssueRepository();
const savedReposRepository = buildSavedReposRepository();

export const container = {
  searchReposUseCase: new SearchReposUseCase(repoRepository),
  getRepoDetailsUseCase: new GetRepoDetailsUseCase(repoRepository),
  listIssuesUseCase: new ListIssuesUseCase(issueRepository),
  countOpenIssuesUseCase: new CountOpenIssuesUseCase(issueRepository),
  listSavedReposUseCase: new ListSavedReposUseCase(savedReposRepository),
  saveRepoUseCase: new SaveRepoUseCase(savedReposRepository),
  unsaveRepoUseCase: new UnsaveRepoUseCase(savedReposRepository),
  isRepoSavedUseCase: new IsRepoSavedUseCase(savedReposRepository),
} as const;

export type Container = typeof container;
