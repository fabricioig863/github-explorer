import type { RecentCommit } from '@/domain/entities/RecentCommit';
import type { UserProfile } from '@/domain/entities/UserProfile';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { EventDto, UserDto } from 'src/infra/http/dtos/UserDto';
import { mapHttpError } from 'src/infra/http/errorMapper';
import { httpClient } from 'src/infra/http/httpClient';
import { mapEventsToRecentCommits } from 'src/infra/http/mappers/eventMapper';
import { mapUserProfile } from 'src/infra/http/mappers/userMapper';

const EVENTS_PAGE_SIZE = 20;

export class GitHubUserRepository implements IUserRepository {
  async getProfile(username: string): Promise<UserProfile> {
    try {
      const response = await httpClient.get<UserDto>(`/users/${username}`);
      return mapUserProfile(response.data);
    } catch (err) {
      mapHttpError(err, `Usuário ${username}`);
    }
  }

  async getRecentCommits(username: string, limit: number): Promise<RecentCommit[]> {
    try {
      const response = await httpClient.get<EventDto[]>(`/users/${username}/events/public`, {
        params: { per_page: EVENTS_PAGE_SIZE },
      });
      return mapEventsToRecentCommits(response.data, limit);
    } catch (err) {
      mapHttpError(err, `Eventos de ${username}`);
    }
  }
}
