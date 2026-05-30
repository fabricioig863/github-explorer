import { createContainer, type Container } from 'src/infra/di/container';
import {
  provideIssueRepository,
  provideRepoRepository,
  provideSavedReposRepository,
  readDiEnv,
} from 'src/infra/di/providers';

const env = readDiEnv();

export const container: Container = createContainer({
  repoRepository: provideRepoRepository(env),
  issueRepository: provideIssueRepository(env),
  savedReposRepository: provideSavedReposRepository(env),
});
