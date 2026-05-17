import type { RecentCommit } from '@/domain/entities/RecentCommit';
import type { UserProfile } from '@/domain/entities/UserProfile';

export interface IUserRepository {
  getProfile(username: string): Promise<UserProfile>;
  getRecentCommits(username: string, limit: number): Promise<RecentCommit[]>;
}
