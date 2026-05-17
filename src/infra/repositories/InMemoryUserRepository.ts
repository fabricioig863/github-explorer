import type { RecentCommit } from '@/domain/entities/RecentCommit';
import type { UserProfile } from '@/domain/entities/UserProfile';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import {
  RECENT_COMMITS_FIXTURE,
  USER_PROFILE_FIXTURE,
} from 'src/infra/repositories/fixtures/users.fixture';

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency(): number {
  return Math.floor(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));
}

export class InMemoryUserRepository implements IUserRepository {
  async getProfile(username: string): Promise<UserProfile> {
    await delay(randomLatency());
    return { ...USER_PROFILE_FIXTURE, login: username };
  }

  async getRecentCommits(_username: string, limit: number): Promise<RecentCommit[]> {
    await delay(randomLatency());
    return RECENT_COMMITS_FIXTURE.slice(0, limit);
  }
}
