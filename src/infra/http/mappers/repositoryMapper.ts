import type { Owner } from '@/domain/entities/Owner';
import type { Repository } from '@/domain/entities/Repository';
import type { OwnerDto, RepositoryDto } from 'src/infra/http/dtos/RepositoryDto';

export function mapOwner(dto: OwnerDto): Owner {
  return {
    id: dto.id,
    login: dto.login,
    avatarUrl: dto.avatar_url,
    type: dto.type,
  };
}

export function mapRepository(dto: RepositoryDto): Repository {
  return {
    id: dto.id,
    name: dto.name,
    fullName: dto.full_name,
    owner: mapOwner(dto.owner),
    description: dto.description,
    stars: dto.stargazers_count,
    forks: dto.forks_count,
    watchers: dto.watchers_count,
    openIssuesCount: dto.open_issues_count,
    language: dto.language,
    htmlUrl: dto.html_url,
    pushedAt: new Date(dto.pushed_at),
    topics: dto.topics ?? [],
    license: dto.license?.name ?? null,
  };
}
