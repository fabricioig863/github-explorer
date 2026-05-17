import type { RecentCommit } from '@/domain/entities/RecentCommit';
import type { EventDto, PushEventDto } from 'src/infra/http/dtos/UserDto';

const SHA_SHORT_LENGTH = 7;

function isPushEvent(event: EventDto): event is PushEventDto {
  return event.type === 'PushEvent';
}

function repoShortName(fullName: string): string {
  const parts = fullName.split('/');
  return parts[1] ?? fullName;
}

export function mapEventsToRecentCommits(events: EventDto[], limit: number): RecentCommit[] {
  const commits: RecentCommit[] = [];

  for (const event of events) {
    if (!isPushEvent(event)) continue;
    const createdAt = new Date(event.created_at);
    const repo = repoShortName(event.repo.name);

    for (const commit of event.payload.commits ?? []) {
      commits.push({
        sha: commit.sha.slice(0, SHA_SHORT_LENGTH),
        message: commit.message.split('\n')[0] ?? '',
        repo,
        createdAt,
      });
      if (commits.length >= limit) return commits;
    }
  }

  return commits;
}
