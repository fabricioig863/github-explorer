export interface UserDto {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

export interface PushEventCommitDto {
  sha: string;
  message: string;
}

export interface PushEventDto {
  type: 'PushEvent';
  created_at: string;
  repo: { name: string };
  payload: { commits?: PushEventCommitDto[] };
}

export interface GenericEventDto {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: unknown;
}

export type EventDto = PushEventDto | GenericEventDto;
