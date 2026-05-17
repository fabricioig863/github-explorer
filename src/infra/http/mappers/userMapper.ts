import type { UserProfile } from '@/domain/entities/UserProfile';
import type { UserDto } from 'src/infra/http/dtos/UserDto';

function normalizeWebsite(blog: string | null): string | null {
  if (blog === null) return null;
  const trimmed = blog.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapUserProfile(dto: UserDto): UserProfile {
  return {
    id: dto.id,
    login: dto.login,
    name: dto.name,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    location: dto.location,
    website: normalizeWebsite(dto.blog),
    followers: dto.followers,
    following: dto.following,
    publicRepos: dto.public_repos,
  };
}
