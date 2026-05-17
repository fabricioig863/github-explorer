import type { Owner } from '@/domain/entities/Owner';

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: Owner;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssuesCount: number;
  language: string | null;
  htmlUrl: string;
  pushedAt: Date;
  topics: string[];
  license: string | null;
}
